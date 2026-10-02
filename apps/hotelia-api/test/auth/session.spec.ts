import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { AuthService } from '../../src/components/auth/auth.service';
import { MemberService } from '../../src/components/member/member.service';
import { MemberStatus, MemberType } from '../../src/libs/enums/member.enum';
import { createHash } from 'crypto';

import { sessionStore } from './session-store';

describe('Refresh sessions', () => {
  let service: AuthService, jwt: JwtService, store: ReturnType<typeof sessionStore>, member: any, memberModel: any;
  beforeEach(() => {
    member = { _id: new Types.ObjectId(), memberType: MemberType.HOTEL_OWNER, memberStatus: MemberStatus.ACTIVE };
    jwt = new JwtService({ secret: 'test-only-secret' });
    store = sessionStore();
    memberModel = { findOne: jest.fn(filter => ({ select: () => ({ lean: () => ({ exec: async () => member.memberStatus === filter.memberStatus && String(member._id) === String(filter._id) ? { ...member } : null }) }) })) };
    service = new AuthService(jwt, memberModel, store.storage as any);
  });
  it('stores only the refresh hash and issues 15-minute access tokens', async () => {
    const pair = await service.createSession(member);
    const payload: any = jwt.decode(pair.accessToken);
    expect(payload.exp - payload.iat).toBe(900);
    expect(payload.sub).toBe(String(member._id));
    expect(payload.type).toBe('access');
    const row = store.rows.get(payload.sid);
    expect(row.refreshTokenHash).toBe(createHash('sha256').update(pair.refreshToken).digest('hex'));
    expect(row).not.toHaveProperty('refreshToken');
    expect(row.expiresAt.getTime() - Date.now()).toBeGreaterThan(6 * 86400000);
    expect((await service.verifyToken(pair.accessToken)).authSessionId).toBe(payload.sid);
  });
  it('rotates once, rejects the previous token and keeps a fixed expiry', async () => {
    const original = await service.createSession(member);
    const expiry = [...store.rows.values()][0].expiresAt;
    const pair = await service.refreshTokens(original.refreshToken);
    expect(pair.refreshToken).not.toBe(original.refreshToken);
    await expect(service.refreshTokens(original.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.refreshTokens(pair.refreshToken)).resolves.toHaveProperty('accessToken');
    expect([...store.rows.values()][0].expiresAt).toBe(expiry);
  });
  it('allows only one winner for simultaneous rotation attempts', async () => {
    const pair = await service.createSession(member);
    const results = await Promise.allSettled([service.refreshTokens(pair.refreshToken), service.refreshTokens(pair.refreshToken)]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
  });
  it('logout invalidates access and refresh tokens but not another device session', async () => {
    const a = await service.createSession(member);
    const b = await service.createSession(member);
    await service.logout(await service.verifyToken(a.accessToken));
    await expect(service.verifyToken(a.accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.refreshTokens(a.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.verifyToken(b.accessToken)).resolves.toHaveProperty('authSessionId');
  });
  it('rejects expired sessions without depending on TTL cleanup', async () => {
    const pair = await service.createSession(member);
    [...store.rows.values()][0].expiresAt = new Date(0);
    await expect(service.verifyToken(pair.accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.refreshTokens(pair.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it.each([MemberStatus.BLOCK, MemberStatus.DELETE])('rejects access and refresh for %s members', async status => {
    const pair = await service.createSession(member); member.memberStatus = status;
    await expect(service.verifyToken(pair.accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.refreshTokens(pair.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('rejects legacy JWTs, expired JWTs and a refresh token used as access', async () => {
    const pair = await service.createSession(member);
    const payload: any = jwt.decode(pair.accessToken);
    for (const token of [jwt.sign({ sub: String(member._id) }), jwt.sign({ sub: payload.sub, sid: payload.sid, type: 'access' }, { expiresIn: -1 }), pair.refreshToken]) {
      await expect(service.verifyToken(token)).rejects.toBeInstanceOf(UnauthorizedException);
    }
  });
  it('rejects forged refresh secrets without revoking a valid session', async () => {
    const pair = await service.createSession(member);
    const forged = pair.refreshToken.slice(0, 25) + '0'.repeat(64);
    await expect(service.refreshTokens(forged)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.refreshTokens(pair.refreshToken)).resolves.toHaveProperty('refreshToken');
  });
  it('rejects session/member mismatches', async () => {
    const pair = await service.createSession(member);
    const payload: any = jwt.decode(pair.accessToken);
    [...store.rows.values()][0].memberId = new Types.ObjectId();
    await expect(service.verifyToken(jwt.sign({ sub: String(member._id), sid: payload.sid, type: 'access' }))).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('does not return tokens when session creation fails', async () => {
    const error = new Error('db down'); store.storage.create.mockRejectedValueOnce(error);
    await expect(service.createSession(member)).rejects.toBe(error);
  });
  it('propagates rotation storage errors', async () => {
    const pair = await service.createSession(member); const error = new Error('db down');
    store.storage.findOneAndUpdate.mockImplementationOnce(() => ({ exec: async () => { throw error; } }));
    await expect(service.refreshTokens(pair.refreshToken)).rejects.toBe(error);
  });
  it('signup and login return both tokens; ordinary profile updates do not create sessions', async () => {
    const auth = { hashPassword: jest.fn().mockResolvedValue('hash'), comparePasswords: jest.fn().mockResolvedValue(true), createSession: jest.fn().mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' }) };
    const model: any = {
      create: jest.fn().mockResolvedValue({ ...member }),
      findOne: () => ({ select: () => ({ exec: async () => ({ ...member, memberPassword: 'hash' }) }) }),
      findOneAndUpdate: () => ({ exec: async () => ({ ...member }) }),
    };
    const members = new MemberService(model, {} as any, auth as any, {} as any, {} as any);
    expect(await members.signup({ memberNick: 'owner', memberEmail: 'owner@example.com', memberPassword: 'secret123' })).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
    expect(await members.login({ memberNick: 'owner', memberPassword: 'secret123' })).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
    await members.updateMember(member._id, { memberFullName: 'Hotel Owner' });
    expect(auth.createSession).toHaveBeenCalledTimes(2);
  });
});
