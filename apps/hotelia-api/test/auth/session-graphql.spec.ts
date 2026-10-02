import { INestApplication, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { GraphQLModule, GraphQLSchemaHost, Query, Resolver } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { getModelToken } from '@nestjs/mongoose';
import { graphql } from 'graphql';
import { Types } from 'mongoose';
import { AuthModule } from '../../src/components/auth/auth.module';
import { AuthService } from '../../src/components/auth/auth.service';
import { AuthGuard } from '../../src/components/auth/guards/auth.guard';
import { AuthMember } from '../../src/components/auth/decorators/authMember.decorator';
import { Member } from '../../src/libs/dto/member/member';
import { MemberStatus, MemberType } from '../../src/libs/enums/member.enum';
import { sessionStore } from './session-store';

@Resolver()
class ProtectedQuery {
  @UseGuards(AuthGuard)
  @Query(() => String)
  currentSession(@AuthMember() member: Member) { return member.authSessionId; }
}

describe('Session GraphQL and DI', () => {
  let app: INestApplication, auth: AuthService;
  const member = { _id: new Types.ObjectId(), memberStatus: MemberStatus.ACTIVE, memberType: MemberType.USER };
  const store = sessionStore();
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [GraphQLModule.forRoot({ driver: ApolloDriver, autoSchemaFile: true }), AuthModule],
      providers: [ProtectedQuery],
    }).overrideProvider(ConfigService).useValue({ get: () => 'test-only-secret' })
      .overrideProvider(getModelToken('Member')).useValue({ findOne: () => ({ select: () => ({ lean: () => ({ exec: async () => ({ ...member }) }) }) }) })
      .overrideProvider(getModelToken('Session')).useValue(store.storage).compile();
    app = module.createNestApplication(); app.useLogger(false); await app.init();
    auth = app.get(AuthService);
  });
  afterAll(async () => app?.close());
  const run = (source: string, variables = {}, access?: string) => graphql({
    schema: app.get(GraphQLSchemaHost).schema, source, variableValues: variables,
    contextValue: { req: { headers: access ? { authorization: 'Bearer ' + access } : {} } },
  });
  it('refresh mutation rotates tokens and logout immediately denies access', async () => {
    const original = await auth.createSession(member as any);
    const refresh = await run('mutation($token:String!){refreshToken(token:$token){accessToken refreshToken}}', { token: original.refreshToken });
    expect(refresh.errors).toBeUndefined();
    const pair = refresh.data!.refreshToken as any;
    expect((await run('{currentSession}', {}, pair.accessToken)).errors).toBeUndefined();
    const logout = await run('mutation{logout}', {}, pair.accessToken);
    expect(logout.errors).toBeUndefined(); expect(logout.data?.logout).toBe(true);
    expect((await run('{currentSession}', {}, original.accessToken)).errors).toBeDefined();
    expect((await run('mutation($token:String!){refreshToken(token:$token){accessToken}}', { token: pair.refreshToken })).errors).toBeDefined();
  });
  it('does not require a valid access token for refresh', async () => {
    const pair = await auth.createSession(member as any);
    const result = await run('mutation($token:String!){refreshToken(token:$token){accessToken}}', { token: pair.refreshToken });
    expect(result.errors).toBeUndefined();
  });
  it('rejects anonymous logout and malformed refresh tokens', async () => {
    expect((await run('mutation{logout}')).errors).toBeDefined();
    expect((await run('mutation{refreshToken(token:"invalid"){accessToken}}')).errors).toBeDefined();
  });
});
