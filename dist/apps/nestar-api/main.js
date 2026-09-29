/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/nestar-api/src/app.controller.ts":
/*!***********************************************!*\
  !*** ./apps/nestar-api/src/app.controller.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apps/nestar-api/src/app.service.ts");
let AppController = class AppController {
    appService;
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),

/***/ "./apps/nestar-api/src/app.module.ts":
/*!*******************************************!*\
  !*** ./apps/nestar-api/src/app.module.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const app_controller_1 = __webpack_require__(/*! ./app.controller */ "./apps/nestar-api/src/app.controller.ts");
const app_service_1 = __webpack_require__(/*! ./app.service */ "./apps/nestar-api/src/app.service.ts");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const apollo_1 = __webpack_require__(/*! @nestjs/apollo */ "@nestjs/apollo");
const app_resolver_1 = __webpack_require__(/*! ./app.resolver */ "./apps/nestar-api/src/app.resolver.ts");
const components_module_1 = __webpack_require__(/*! ./components/components.module */ "./apps/nestar-api/src/components/components.module.ts");
const database_module_1 = __webpack_require__(/*! ./database/database.module */ "./apps/nestar-api/src/database/database.module.ts");
const socket_module_1 = __webpack_require__(/*! ./socket/socket.module */ "./apps/nestar-api/src/socket/socket.module.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot(), graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                playground: true,
                uploads: false,
                autoSchemaFile: true,
                formatError: (error) => {
                    const graphQLFormattedError = {
                        code: error?.extensions.code,
                        message: error?.extensions?.exception?.response?.message || error?.extensions?.response?.message || error?.message,
                    };
                    console.log("ERR:", error);
                    console.log("GRAPHQL GLOBAL ERR:", graphQLFormattedError);
                    return graphQLFormattedError;
                }
            }),
            components_module_1.ComponentsModule,
            database_module_1.DatabaseModule,
            socket_module_1.SocketModule],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, app_resolver_1.AppResolver],
    })
], AppModule);


/***/ }),

/***/ "./apps/nestar-api/src/app.resolver.ts":
/*!*********************************************!*\
  !*** ./apps/nestar-api/src/app.resolver.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppResolver = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
let AppResolver = class AppResolver {
    sayHello() {
        return 'GraphQL API Server';
    }
};
exports.AppResolver = AppResolver;
__decorate([
    (0, graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppResolver.prototype, "sayHello", null);
exports.AppResolver = AppResolver = __decorate([
    (0, graphql_1.Resolver)()
], AppResolver);


/***/ }),

/***/ "./apps/nestar-api/src/app.service.ts":
/*!********************************************!*\
  !*** ./apps/nestar-api/src/app.service.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
let AppService = class AppService {
    getHello() {
        return 'Welcome to Nestar Rest API Server!';
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),

/***/ "./apps/nestar-api/src/components/auth/auth.module.ts":
/*!************************************************************!*\
  !*** ./apps/nestar-api/src/components/auth/auth.module.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./apps/nestar-api/src/components/auth/auth.service.ts");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            jwt_1.JwtModule.register({
                secret: `${process.env.SECRET_TOKEN}`,
                signOptions: { expiresIn: '30d' },
            }),
        ],
        providers: [auth_service_1.AuthService],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);


/***/ }),

/***/ "./apps/nestar-api/src/components/auth/auth.service.ts":
/*!*************************************************************!*\
  !*** ./apps/nestar-api/src/components/auth/auth.service.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const bcrypt = __importStar(__webpack_require__(/*! bcryptjs */ "bcryptjs"));
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
let AuthService = class AuthService {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async hashPassword(memberPassword) {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(memberPassword, salt);
    }
    async comparePasswords(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
    async createToken(member) {
        const payload = {};
        Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
            payload[`${ele}`] = member[`${ele}`];
        });
        delete payload.memberPassword;
        return await this.jwtService.signAsync(payload);
    }
    async verifyToken(token) {
        const member = await this.jwtService.verifyAsync(token);
        member._id = (0, config_1.shapeIntoMongoObjectId)(member._id);
        return member;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object])
], AuthService);


/***/ }),

/***/ "./apps/nestar-api/src/components/auth/decorators/authMember.decorator.ts":
/*!********************************************************************************!*\
  !*** ./apps/nestar-api/src/components/auth/decorators/authMember.decorator.ts ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthMember = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.AuthMember = (0, common_1.createParamDecorator)((data, context) => {
    let request;
    if (context.contextType === 'graphql') {
        request = context.getArgByIndex(2).req;
        if (request.body.authMember) {
            request.body.authMember.authorization = request.headers?.authorization;
        }
    }
    else
        request = context.switchToHttp().getRequest();
    const member = request.body.authMember;
    if (member)
        return data ? member?.[data] : member;
    else
        return null;
});


/***/ }),

/***/ "./apps/nestar-api/src/components/auth/decorators/roles.decorator.ts":
/*!***************************************************************************!*\
  !*** ./apps/nestar-api/src/components/auth/decorators/roles.decorator.ts ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const Roles = (...roles) => (0, common_1.SetMetadata)('roles', roles);
exports.Roles = Roles;


/***/ }),

/***/ "./apps/nestar-api/src/components/auth/guards/auth.guard.ts":
/*!******************************************************************!*\
  !*** ./apps/nestar-api/src/components/auth/guards/auth.guard.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_service_1 = __webpack_require__(/*! ../auth.service */ "./apps/nestar-api/src/components/auth/auth.service.ts");
const common_enum_1 = __webpack_require__(/*! apps/nestar-api/src/libs/enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
let AuthGuard = class AuthGuard {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        console.info('--- @guard() Authentication [AuthGuard] ---');
        if (context.contextType === 'graphql') {
            const request = context.getArgByIndex(2).req;
            const bearerToken = request.headers.authorization;
            if (!bearerToken)
                throw new common_1.BadRequestException(common_enum_1.Message.TOKEN_NOT_EXIST);
            const token = bearerToken.split(' ')[1], authMember = await this.authService.verifyToken(token);
            if (!authMember)
                throw new common_1.UnauthorizedException(common_enum_1.Message.NOT_AUTHENTICATED);
            console.log('memberNick[auth] =>', authMember.memberNick);
            request.body.authMember = authMember;
        }
        return true;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthGuard);


/***/ }),

/***/ "./apps/nestar-api/src/components/auth/guards/roles.guard.ts":
/*!*******************************************************************!*\
  !*** ./apps/nestar-api/src/components/auth/guards/roles.guard.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const auth_service_1 = __webpack_require__(/*! ../auth.service */ "./apps/nestar-api/src/components/auth/auth.service.ts");
const common_enum_1 = __webpack_require__(/*! apps/nestar-api/src/libs/enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
let RolesGuard = class RolesGuard {
    reflector;
    authService;
    constructor(reflector, authService) {
        this.reflector = reflector;
        this.authService = authService;
    }
    async canActivate(context) {
        const roles = this.reflector.get('roles', context.getHandler());
        if (!roles)
            return true;
        console.info(`--- @guard() Authentication [RolesGuard]: ${roles} ---`);
        if (context.contextType === 'graphql') {
            const request = context.getArgByIndex(2).req;
            const bearerToken = request.headers.authorization;
            if (!bearerToken)
                throw new common_1.BadRequestException(common_enum_1.Message.TOKEN_NOT_EXIST);
            const token = bearerToken.split(' ')[1], authMember = await this.authService.verifyToken(token), hasRole = () => roles.indexOf(authMember.memberType) > -1, hasPermission = hasRole();
            if (!authMember || !hasPermission)
                throw new common_1.ForbiddenException(common_enum_1.Message.ONLY_SPECIFIC_ROLES_ALLOWED);
            console.log('memberNick[roles] =>', authMember.memberNick);
            request.body.authMember = authMember;
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object])
], RolesGuard);


/***/ }),

/***/ "./apps/nestar-api/src/components/auth/guards/without.guard.ts":
/*!*********************************************************************!*\
  !*** ./apps/nestar-api/src/components/auth/guards/without.guard.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WithoutGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_service_1 = __webpack_require__(/*! ../auth.service */ "./apps/nestar-api/src/components/auth/auth.service.ts");
let WithoutGuard = class WithoutGuard {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async canActivate(context) {
        console.info('--- @guard() Authentication [WithoutGuard] ---');
        if (context.contextType === 'graphql') {
            const request = context.getArgByIndex(2).req, bearerToken = request.headers.authorization;
            if (bearerToken) {
                try {
                    const token = bearerToken.split(' ')[1], authMember = await this.authService.verifyToken(token);
                    request.body.authMember = authMember;
                }
                catch (err) {
                    request.body.authMember = null;
                }
            }
            else
                request.body.authMember = null;
            console.log('memberNick[without] =>', request.body.authMember?.memberNick ?? 'none');
        }
        return true;
    }
};
exports.WithoutGuard = WithoutGuard;
exports.WithoutGuard = WithoutGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], WithoutGuard);


/***/ }),

/***/ "./apps/nestar-api/src/components/board-article/board-article.module.ts":
/*!******************************************************************************!*\
  !*** ./apps/nestar-api/src/components/board-article/board-article.module.ts ***!
  \******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BoardArticleModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const board_article_resolver_1 = __webpack_require__(/*! ./board-article.resolver */ "./apps/nestar-api/src/components/board-article/board-article.resolver.ts");
const board_article_service_1 = __webpack_require__(/*! ./board-article.service */ "./apps/nestar-api/src/components/board-article/board-article.service.ts");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const BoardArticle_model_1 = __importDefault(__webpack_require__(/*! ../../schemas/BoardArticle.model */ "./apps/nestar-api/src/schemas/BoardArticle.model.ts"));
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./apps/nestar-api/src/components/auth/auth.module.ts");
const member_module_1 = __webpack_require__(/*! ../member/member.module */ "./apps/nestar-api/src/components/member/member.module.ts");
const view_module_1 = __webpack_require__(/*! ../view/view.module */ "./apps/nestar-api/src/components/view/view.module.ts");
const like_module_1 = __webpack_require__(/*! ../like/like.module */ "./apps/nestar-api/src/components/like/like.module.ts");
let BoardArticleModule = class BoardArticleModule {
};
exports.BoardArticleModule = BoardArticleModule;
exports.BoardArticleModule = BoardArticleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: "BoardArticle",
                    schema: BoardArticle_model_1.default,
                },
            ]),
            auth_module_1.AuthModule,
            member_module_1.MemberModule,
            view_module_1.ViewModule,
            like_module_1.LikeModule,
        ],
        providers: [board_article_resolver_1.BoardArticleResolver, board_article_service_1.BoardArticleService],
        exports: [board_article_service_1.BoardArticleService],
    })
], BoardArticleModule);


/***/ }),

/***/ "./apps/nestar-api/src/components/board-article/board-article.resolver.ts":
/*!********************************************************************************!*\
  !*** ./apps/nestar-api/src/components/board-article/board-article.resolver.ts ***!
  \********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BoardArticleResolver = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_guard_1 = __webpack_require__(/*! ../auth/guards/auth.guard */ "./apps/nestar-api/src/components/auth/guards/auth.guard.ts");
const authMember_decorator_1 = __webpack_require__(/*! ../auth/decorators/authMember.decorator */ "./apps/nestar-api/src/components/auth/decorators/authMember.decorator.ts");
const without_guard_1 = __webpack_require__(/*! ../auth/guards/without.guard */ "./apps/nestar-api/src/components/auth/guards/without.guard.ts");
const board_article_service_1 = __webpack_require__(/*! ./board-article.service */ "./apps/nestar-api/src/components/board-article/board-article.service.ts");
const board_article_update_1 = __webpack_require__(/*! ../../libs/dto/board-article/board-article.update */ "./apps/nestar-api/src/libs/dto/board-article/board-article.update.ts");
const board_article_input_1 = __webpack_require__(/*! ../../libs/dto/board-article/board-article.input */ "./apps/nestar-api/src/libs/dto/board-article/board-article.input.ts");
const board_article_1 = __webpack_require__(/*! ../../libs/dto/board-article/board-article */ "./apps/nestar-api/src/libs/dto/board-article/board-article.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
const roles_guard_1 = __webpack_require__(/*! ../auth/guards/roles.guard */ "./apps/nestar-api/src/components/auth/guards/roles.guard.ts");
const member_enum_1 = __webpack_require__(/*! ../../libs/enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const roles_decorator_1 = __webpack_require__(/*! ../auth/decorators/roles.decorator */ "./apps/nestar-api/src/components/auth/decorators/roles.decorator.ts");
let BoardArticleResolver = class BoardArticleResolver {
    boardArticleService;
    constructor(boardArticleService) {
        this.boardArticleService = boardArticleService;
    }
    async createBoardArticle(input, memberId) {
        console.log('Mutation: createBoardArticle');
        return await this.boardArticleService.createBoardArticle(memberId, input);
    }
    async getBoardArticle(input, memberId) {
        console.log('Query: getProperty');
        const articleId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.boardArticleService.getBoardArticle(memberId, articleId);
    }
    async updateBoardArticle(input, memberId) {
        console.log('Mutation: updateBoardArticle');
        input._id = (0, config_1.shapeIntoMongoObjectId)(input._id);
        return await this.boardArticleService.updateBoardArticle(memberId, input);
    }
    async getBoardArticles(input, memberId) {
        console.log('Query: getBoardArticles');
        return await this.boardArticleService.getBoardArticles(memberId, input);
    }
    async likeTargetBoardArticle(input, memberId) {
        console.log('Mutation: likeTargetBoardArticle');
        const likeRefId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.boardArticleService.likeTargetBoardArticle(memberId, likeRefId);
    }
    async getAllBoardArticlesByAdmin(input, memberId) {
        console.log('Query: getAllBoardArticlesByAdmin');
        return await this.boardArticleService.getAllBoardArticlesByAdmin(input);
    }
    async updateBoardArticleByAdmin(input, memberId) {
        console.log('Mutation: updateBoardArticleByAdmin');
        return await this.boardArticleService.updateBoardArticleByAdmin(input);
    }
    async removeBoardArticleByAdmin(input, memberId) {
        console.log('Mutation: removeBoardArticleByAdmin');
        const articleId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.boardArticleService.removeBoardArticleByAdmin(articleId);
    }
};
exports.BoardArticleResolver = BoardArticleResolver;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)((returns) => board_article_1.BoardArticle),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof board_article_input_1.BoardArticleInput !== "undefined" && board_article_input_1.BoardArticleInput) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], BoardArticleResolver.prototype, "createBoardArticle", null);
__decorate([
    (0, common_1.UseGuards)(without_guard_1.WithoutGuard),
    (0, graphql_1.Query)((returns) => board_article_1.BoardArticle),
    __param(0, (0, graphql_1.Args)('articleId')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], BoardArticleResolver.prototype, "getBoardArticle", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)(() => board_article_1.BoardArticle),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof board_article_update_1.BoardArticleUpdate !== "undefined" && board_article_update_1.BoardArticleUpdate) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], BoardArticleResolver.prototype, "updateBoardArticle", null);
__decorate([
    (0, common_1.UseGuards)(without_guard_1.WithoutGuard),
    (0, graphql_1.Query)((returns) => board_article_1.BoardArticles),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof board_article_input_1.BoardArticlesInquiry !== "undefined" && board_article_input_1.BoardArticlesInquiry) === "function" ? _g : Object, Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], BoardArticleResolver.prototype, "getBoardArticles", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)(() => board_article_1.BoardArticle),
    __param(0, (0, graphql_1.Args)('articleId')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], BoardArticleResolver.prototype, "likeTargetBoardArticle", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Query)((returns) => board_article_1.BoardArticles),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof board_article_input_1.AllBoardArticlesInquiry !== "undefined" && board_article_input_1.AllBoardArticlesInquiry) === "function" ? _k : Object, Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], BoardArticleResolver.prototype, "getAllBoardArticlesByAdmin", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Mutation)(() => board_article_1.BoardArticle),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof board_article_update_1.BoardArticleUpdate !== "undefined" && board_article_update_1.BoardArticleUpdate) === "function" ? _m : Object, Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], BoardArticleResolver.prototype, "updateBoardArticleByAdmin", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Mutation)((returns) => board_article_1.BoardArticle),
    __param(0, (0, graphql_1.Args)('articleId')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], BoardArticleResolver.prototype, "removeBoardArticleByAdmin", null);
exports.BoardArticleResolver = BoardArticleResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [typeof (_a = typeof board_article_service_1.BoardArticleService !== "undefined" && board_article_service_1.BoardArticleService) === "function" ? _a : Object])
], BoardArticleResolver);


/***/ }),

/***/ "./apps/nestar-api/src/components/board-article/board-article.service.ts":
/*!*******************************************************************************!*\
  !*** ./apps/nestar-api/src/components/board-article/board-article.service.ts ***!
  \*******************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BoardArticleService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const member_service_1 = __webpack_require__(/*! ../member/member.service */ "./apps/nestar-api/src/components/member/member.service.ts");
const view_service_1 = __webpack_require__(/*! ../view/view.service */ "./apps/nestar-api/src/components/view/view.service.ts");
const common_enum_1 = __webpack_require__(/*! ../../libs/enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
const board_article_enum_1 = __webpack_require__(/*! ../../libs/enums/board-article.enum */ "./apps/nestar-api/src/libs/enums/board-article.enum.ts");
const view_enum_1 = __webpack_require__(/*! ../../libs/enums/view.enum */ "./apps/nestar-api/src/libs/enums/view.enum.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
const like_enum_1 = __webpack_require__(/*! ../../libs/enums/like.enum */ "./apps/nestar-api/src/libs/enums/like.enum.ts");
const like_service_1 = __webpack_require__(/*! ../like/like.service */ "./apps/nestar-api/src/components/like/like.service.ts");
let BoardArticleService = class BoardArticleService {
    boardArticleModel;
    memberService;
    viewService;
    likeService;
    constructor(boardArticleModel, memberService, viewService, likeService) {
        this.boardArticleModel = boardArticleModel;
        this.memberService = memberService;
        this.viewService = viewService;
        this.likeService = likeService;
    }
    async createBoardArticle(memberId, input) {
        input.memberId = memberId;
        try {
            const result = await this.boardArticleModel.create(input);
            await this.memberService.memberStatsEditor({
                _id: memberId,
                targetKey: 'memberArticles',
                modifier: 1,
            });
            return result;
        }
        catch (err) {
            console.log('Error, Service.model:', err instanceof Error ? err.message : err);
            throw new common_1.BadRequestException(common_enum_1.Message.CREATE_FAILED);
        }
    }
    async getBoardArticle(memberId, articleId) {
        const search = {
            _id: articleId,
            articleStatus: board_article_enum_1.BoardArticleStatus.ACTIVE,
        };
        const targetBoardArticle = await this.boardArticleModel.findOne(search).lean().exec();
        if (!targetBoardArticle)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        if (memberId) {
            const viewInput = { memberId: memberId, viewRefId: articleId, viewGroup: view_enum_1.ViewGroup.ARTICLE };
            const newView = await this.viewService.recordView(viewInput);
            if (newView) {
                await this.boardArticleStatsEditor({ _id: articleId, targetKey: 'articleViews', modifier: 1 });
                targetBoardArticle.articleViews++;
            }
            const likeInput = { memberId: memberId, likeRefId: articleId, likeGroup: like_enum_1.LikeGroup.ARTICLE };
            targetBoardArticle.meLiked = await this.likeService.checkLikeExistence(likeInput);
            targetBoardArticle.meLiked;
        }
        targetBoardArticle.memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
        return targetBoardArticle;
    }
    async updateBoardArticle(memberId, input) {
        const { _id, articleStatus } = input;
        const result = await this.boardArticleModel
            .findOneAndUpdate({ _id: _id, memberId: memberId, articleStatus: board_article_enum_1.BoardArticleStatus.ACTIVE }, input, {
            new: true,
        })
            .exec();
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.UPDATE_FAILED);
        if (articleStatus === board_article_enum_1.BoardArticleStatus.DELETE) {
            await this.memberService.memberStatsEditor({
                _id: memberId,
                targetKey: 'memberArticles',
                modifier: -1,
            });
        }
        return result;
    }
    async getBoardArticles(memberId, input) {
        const { articleCategory, text } = input.search;
        const match = { articleStatus: board_article_enum_1.BoardArticleStatus.ACTIVE };
        const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? common_enum_1.Direction.DESC };
        if (articleCategory)
            match.articleCategory = articleCategory;
        if (text)
            match.articleTitle = { $regex: new RegExp(text, 'i') };
        if (input.search?.memberId) {
            match.memberId = (0, config_1.shapeIntoMongoObjectId)(input.search.memberId);
        }
        console.log('match:', match);
        const result = await this.boardArticleModel
            .aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        (0, config_1.lookupAuthMemberLiked)(memberId),
                        config_1.lookupMember,
                        { $unwind: '$memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        if (!result.length)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        return result[0];
    }
    async likeTargetBoardArticle(memberId, likeRefId) {
        const target = await this.boardArticleModel
            .findOne({ _id: likeRefId, articleStatus: board_article_enum_1.BoardArticleStatus.ACTIVE })
            .exec();
        if (!target)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        const input = {
            memberId: memberId,
            likeRefId: likeRefId,
            likeGroup: like_enum_1.LikeGroup.ARTICLE,
        };
        const modifier = await this.likeService.toggleLike(input);
        const result = await this.boardArticleStatsEditor({ _id: likeRefId, targetKey: 'articleLikes', modifier: modifier });
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.SOMETHING_WENT_WRONG);
        return result;
    }
    async getAllBoardArticlesByAdmin(input) {
        const { articleStatus, articleCategory } = input.search;
        const match = {};
        const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? common_enum_1.Direction.DESC };
        if (articleStatus)
            match.articleStatus = articleStatus;
        if (articleCategory)
            match.articleCategory = articleCategory;
        const result = await this.boardArticleModel
            .aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        config_1.lookupMember,
                        { $unwind: '$memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        if (!result.length)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        return result[0];
    }
    async updateBoardArticleByAdmin(input) {
        const { _id, articleStatus } = input;
        const result = await this.boardArticleModel
            .findOneAndUpdate({ _id: _id, articleStatus: board_article_enum_1.BoardArticleStatus.ACTIVE }, input, {
            new: true,
        })
            .exec();
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.UPDATE_FAILED);
        if (articleStatus === board_article_enum_1.BoardArticleStatus.DELETE) {
            await this.memberService.memberStatsEditor({
                _id: result.memberId,
                targetKey: 'memberArticles',
                modifier: -1,
            });
        }
        return result;
    }
    async removeBoardArticleByAdmin(articleId) {
        const search = { _id: articleId, articleStatus: board_article_enum_1.BoardArticleStatus.DELETE };
        const result = await this.boardArticleModel.findOneAndDelete(search).exec();
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.REMOVE_FAILED);
        return result;
    }
    async boardArticleStatsEditor(input) {
        const { _id, targetKey, modifier } = input;
        return await this.boardArticleModel
            .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, {
            new: true,
        })
            .exec();
    }
};
exports.BoardArticleService = BoardArticleService;
exports.BoardArticleService = BoardArticleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('BoardArticle')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof member_service_1.MemberService !== "undefined" && member_service_1.MemberService) === "function" ? _b : Object, typeof (_c = typeof view_service_1.ViewService !== "undefined" && view_service_1.ViewService) === "function" ? _c : Object, typeof (_d = typeof like_service_1.LikeService !== "undefined" && like_service_1.LikeService) === "function" ? _d : Object])
], BoardArticleService);


/***/ }),

/***/ "./apps/nestar-api/src/components/comment/comment.module.ts":
/*!******************************************************************!*\
  !*** ./apps/nestar-api/src/components/comment/comment.module.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const comment_resolver_1 = __webpack_require__(/*! ./comment.resolver */ "./apps/nestar-api/src/components/comment/comment.resolver.ts");
const comment_service_1 = __webpack_require__(/*! ./comment.service */ "./apps/nestar-api/src/components/comment/comment.service.ts");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const Comment_model_1 = __importDefault(__webpack_require__(/*! ../../schemas/Comment.model */ "./apps/nestar-api/src/schemas/Comment.model.ts"));
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./apps/nestar-api/src/components/auth/auth.module.ts");
const member_module_1 = __webpack_require__(/*! ../member/member.module */ "./apps/nestar-api/src/components/member/member.module.ts");
const view_module_1 = __webpack_require__(/*! ../view/view.module */ "./apps/nestar-api/src/components/view/view.module.ts");
const board_article_module_1 = __webpack_require__(/*! ../board-article/board-article.module */ "./apps/nestar-api/src/components/board-article/board-article.module.ts");
const property_module_1 = __webpack_require__(/*! ../property/property.module */ "./apps/nestar-api/src/components/property/property.module.ts");
let CommentModule = class CommentModule {
};
exports.CommentModule = CommentModule;
exports.CommentModule = CommentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: "Comment",
                    schema: Comment_model_1.default,
                },
            ]),
            auth_module_1.AuthModule,
            member_module_1.MemberModule,
            view_module_1.ViewModule,
            board_article_module_1.BoardArticleModule,
            property_module_1.PropertyModule
        ],
        providers: [comment_resolver_1.CommentResolver, comment_service_1.CommentService],
        exports: [comment_service_1.CommentService]
    })
], CommentModule);


/***/ }),

/***/ "./apps/nestar-api/src/components/comment/comment.resolver.ts":
/*!********************************************************************!*\
  !*** ./apps/nestar-api/src/components/comment/comment.resolver.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentResolver = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const comment_service_1 = __webpack_require__(/*! ./comment.service */ "./apps/nestar-api/src/components/comment/comment.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const auth_guard_1 = __webpack_require__(/*! ../auth/guards/auth.guard */ "./apps/nestar-api/src/components/auth/guards/auth.guard.ts");
const comment_input_1 = __webpack_require__(/*! ../../libs/dto/comment/comment.input */ "./apps/nestar-api/src/libs/dto/comment/comment.input.ts");
const authMember_decorator_1 = __webpack_require__(/*! ../auth/decorators/authMember.decorator */ "./apps/nestar-api/src/components/auth/decorators/authMember.decorator.ts");
const comment_1 = __webpack_require__(/*! ../../libs/dto/comment/comment */ "./apps/nestar-api/src/libs/dto/comment/comment.ts");
const comment_update_1 = __webpack_require__(/*! ../../libs/dto/comment/comment.update */ "./apps/nestar-api/src/libs/dto/comment/comment.update.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
const without_guard_1 = __webpack_require__(/*! ../auth/guards/without.guard */ "./apps/nestar-api/src/components/auth/guards/without.guard.ts");
const roles_decorator_1 = __webpack_require__(/*! ../auth/decorators/roles.decorator */ "./apps/nestar-api/src/components/auth/decorators/roles.decorator.ts");
const member_enum_1 = __webpack_require__(/*! ../../libs/enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const roles_guard_1 = __webpack_require__(/*! ../auth/guards/roles.guard */ "./apps/nestar-api/src/components/auth/guards/roles.guard.ts");
let CommentResolver = class CommentResolver {
    commentService;
    constructor(commentService) {
        this.commentService = commentService;
    }
    async createComment(input, memberId) {
        console.log('Mutation: createComment');
        return await this.commentService.createComment(memberId, input);
    }
    async updateComment(input, memberId) {
        console.log('Mutation: updateComment');
        input._id = (0, config_1.shapeIntoMongoObjectId)(input._id);
        return await this.commentService.updateComment(memberId, input);
    }
    async getComments(input, memberId) {
        console.log('Query: getComments');
        input.search.commentRefId = (0, config_1.shapeIntoMongoObjectId)(input.search.commentRefId);
        return await this.commentService.getComments(memberId, input);
    }
    async removeCommentByAdmin(input) {
        console.log('Mutation: removeCommentByAdmin');
        const commentId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.commentService.removeCommentByAdmin(commentId);
    }
};
exports.CommentResolver = CommentResolver;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)(() => comment_1.Comment),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof comment_input_1.CommentInput !== "undefined" && comment_input_1.CommentInput) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], CommentResolver.prototype, "createComment", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)(() => comment_1.Comment),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof comment_update_1.CommentUpdate !== "undefined" && comment_update_1.CommentUpdate) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], CommentResolver.prototype, "updateComment", null);
__decorate([
    (0, common_1.UseGuards)(without_guard_1.WithoutGuard),
    (0, graphql_1.Query)(() => comment_1.Comments),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof comment_input_1.CommentsInquiry !== "undefined" && comment_input_1.CommentsInquiry) === "function" ? _f : Object, Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], CommentResolver.prototype, "getComments", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Mutation)((returns) => comment_1.Comment),
    __param(0, (0, graphql_1.Args)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], CommentResolver.prototype, "removeCommentByAdmin", null);
exports.CommentResolver = CommentResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [typeof (_a = typeof comment_service_1.CommentService !== "undefined" && comment_service_1.CommentService) === "function" ? _a : Object])
], CommentResolver);


/***/ }),

/***/ "./apps/nestar-api/src/components/comment/comment.service.ts":
/*!*******************************************************************!*\
  !*** ./apps/nestar-api/src/components/comment/comment.service.ts ***!
  \*******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const member_service_1 = __webpack_require__(/*! ../member/member.service */ "./apps/nestar-api/src/components/member/member.service.ts");
const property_service_1 = __webpack_require__(/*! ../property/property.service */ "./apps/nestar-api/src/components/property/property.service.ts");
const board_article_service_1 = __webpack_require__(/*! ../board-article/board-article.service */ "./apps/nestar-api/src/components/board-article/board-article.service.ts");
const common_enum_1 = __webpack_require__(/*! ../../libs/enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
const comment_enum_1 = __webpack_require__(/*! ../../libs/enums/comment.enum */ "./apps/nestar-api/src/libs/enums/comment.enum.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
let CommentService = class CommentService {
    commentModel;
    memberService;
    propertyService;
    boardArticleService;
    constructor(commentModel, memberService, propertyService, boardArticleService) {
        this.commentModel = commentModel;
        this.memberService = memberService;
        this.propertyService = propertyService;
        this.boardArticleService = boardArticleService;
    }
    async createComment(memberId, input) {
        input.memberId = memberId;
        let result = null;
        try {
            result = await this.commentModel.create(input);
        }
        catch (err) {
            console.log('Error, Service.model:', err);
            throw new common_1.BadRequestException(common_enum_1.Message.CREATE_FAILED);
        }
        switch (input.commentGroup) {
            case comment_enum_1.CommentGroup.PROPERTY:
                await this.propertyService.propertyStatsEditor({
                    _id: input.commentRefId,
                    targetKey: 'propertyComments',
                    modifier: 1,
                });
                break;
            case comment_enum_1.CommentGroup.ARTICLE:
                await this.boardArticleService.boardArticleStatsEditor({
                    _id: input.commentRefId,
                    targetKey: 'articleComments',
                    modifier: 1,
                });
                break;
            case comment_enum_1.CommentGroup.MEMBER:
                await this.memberService.memberStatsEditor({
                    _id: input.commentRefId,
                    targetKey: 'memberComments',
                    modifier: 1,
                });
                break;
        }
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.CREATE_FAILED);
        return result;
    }
    async updateComment(memberId, input) {
        const { _id } = input;
        const result = await this.commentModel.findOneAndUpdate({
            _id: _id,
            memberId: memberId,
            commentStatus: comment_enum_1.CommentStatus.ACTIVE,
        }, input, {
            new: true,
        });
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.UPDATE_FAILED);
        return result;
    }
    async getComments(memberId, input) {
        const { commentRefId } = input.search;
        const match = { commentRefId: commentRefId, commentStatus: comment_enum_1.CommentStatus.ACTIVE };
        const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? common_enum_1.Direction.DESC };
        const result = await this.commentModel.aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        config_1.lookupMember,
                        { $unwind: '$memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ]);
        if (!result.length)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        return result[0];
    }
    async removeCommentByAdmin(input) {
        const result = await this.commentModel.findByIdAndDelete(input);
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.REMOVE_FAILED);
        switch (result.commentGroup) {
            case comment_enum_1.CommentGroup.PROPERTY:
                await this.propertyService.propertyStatsEditor({
                    _id: result.commentRefId,
                    targetKey: 'propertyComments',
                    modifier: -1,
                });
                break;
            case comment_enum_1.CommentGroup.ARTICLE:
                await this.boardArticleService.boardArticleStatsEditor({
                    _id: result.commentRefId,
                    targetKey: 'articleComments',
                    modifier: -1,
                });
                break;
            case comment_enum_1.CommentGroup.MEMBER:
                await this.memberService.memberStatsEditor({
                    _id: result.commentRefId,
                    targetKey: 'memberComments',
                    modifier: -1,
                });
                break;
        }
        return result;
    }
};
exports.CommentService = CommentService;
exports.CommentService = CommentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Comment')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof member_service_1.MemberService !== "undefined" && member_service_1.MemberService) === "function" ? _b : Object, typeof (_c = typeof property_service_1.PropertyService !== "undefined" && property_service_1.PropertyService) === "function" ? _c : Object, typeof (_d = typeof board_article_service_1.BoardArticleService !== "undefined" && board_article_service_1.BoardArticleService) === "function" ? _d : Object])
], CommentService);


/***/ }),

/***/ "./apps/nestar-api/src/components/components.module.ts":
/*!*************************************************************!*\
  !*** ./apps/nestar-api/src/components/components.module.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ComponentsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const member_module_1 = __webpack_require__(/*! ./member/member.module */ "./apps/nestar-api/src/components/member/member.module.ts");
const property_module_1 = __webpack_require__(/*! ./property/property.module */ "./apps/nestar-api/src/components/property/property.module.ts");
const auth_module_1 = __webpack_require__(/*! ./auth/auth.module */ "./apps/nestar-api/src/components/auth/auth.module.ts");
const view_module_1 = __webpack_require__(/*! ./view/view.module */ "./apps/nestar-api/src/components/view/view.module.ts");
const follow_module_1 = __webpack_require__(/*! ./follow/follow.module */ "./apps/nestar-api/src/components/follow/follow.module.ts");
const board_article_module_1 = __webpack_require__(/*! ./board-article/board-article.module */ "./apps/nestar-api/src/components/board-article/board-article.module.ts");
const like_module_1 = __webpack_require__(/*! ./like/like.module */ "./apps/nestar-api/src/components/like/like.module.ts");
const comment_module_1 = __webpack_require__(/*! ./comment/comment.module */ "./apps/nestar-api/src/components/comment/comment.module.ts");
let ComponentsModule = class ComponentsModule {
};
exports.ComponentsModule = ComponentsModule;
exports.ComponentsModule = ComponentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            member_module_1.MemberModule,
            auth_module_1.AuthModule,
            property_module_1.PropertyModule,
            board_article_module_1.BoardArticleModule,
            like_module_1.LikeModule,
            view_module_1.ViewModule,
            comment_module_1.CommentModule,
            follow_module_1.FollowModule,
        ],
    })
], ComponentsModule);


/***/ }),

/***/ "./apps/nestar-api/src/components/follow/follow.module.ts":
/*!****************************************************************!*\
  !*** ./apps/nestar-api/src/components/follow/follow.module.ts ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FollowModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const Follow_model_1 = __importDefault(__webpack_require__(/*! ../../schemas/Follow.model */ "./apps/nestar-api/src/schemas/Follow.model.ts"));
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./apps/nestar-api/src/components/auth/auth.module.ts");
const view_module_1 = __webpack_require__(/*! ../view/view.module */ "./apps/nestar-api/src/components/view/view.module.ts");
const like_module_1 = __webpack_require__(/*! ../like/like.module */ "./apps/nestar-api/src/components/like/like.module.ts");
const follow_resolver_1 = __webpack_require__(/*! ./follow.resolver */ "./apps/nestar-api/src/components/follow/follow.resolver.ts");
const follow_service_1 = __webpack_require__(/*! ./follow.service */ "./apps/nestar-api/src/components/follow/follow.service.ts");
const member_module_1 = __webpack_require__(/*! ../member/member.module */ "./apps/nestar-api/src/components/member/member.module.ts");
let FollowModule = class FollowModule {
};
exports.FollowModule = FollowModule;
exports.FollowModule = FollowModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: "Follow",
                    schema: Follow_model_1.default
                },
            ]),
            auth_module_1.AuthModule,
            view_module_1.ViewModule,
            like_module_1.LikeModule,
            member_module_1.MemberModule,
        ],
        providers: [follow_resolver_1.FollowResolver, follow_service_1.FollowService],
        exports: [follow_service_1.FollowService],
    })
], FollowModule);


/***/ }),

/***/ "./apps/nestar-api/src/components/follow/follow.resolver.ts":
/*!******************************************************************!*\
  !*** ./apps/nestar-api/src/components/follow/follow.resolver.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FollowResolver = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const follow_service_1 = __webpack_require__(/*! ./follow.service */ "./apps/nestar-api/src/components/follow/follow.service.ts");
const auth_guard_1 = __webpack_require__(/*! ../auth/guards/auth.guard */ "./apps/nestar-api/src/components/auth/guards/auth.guard.ts");
const follow_1 = __webpack_require__(/*! ../../libs/dto/follow/follow */ "./apps/nestar-api/src/libs/dto/follow/follow.ts");
const authMember_decorator_1 = __webpack_require__(/*! ../auth/decorators/authMember.decorator */ "./apps/nestar-api/src/components/auth/decorators/authMember.decorator.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
const without_guard_1 = __webpack_require__(/*! ../auth/guards/without.guard */ "./apps/nestar-api/src/components/auth/guards/without.guard.ts");
const follow_input_1 = __webpack_require__(/*! ../../libs/dto/follow/follow.input */ "./apps/nestar-api/src/libs/dto/follow/follow.input.ts");
let FollowResolver = class FollowResolver {
    followService;
    constructor(followService) {
        this.followService = followService;
    }
    async subscribe(input, memberId) {
        console.log('Mutation: subscribe');
        const followingId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.followService.subscribe(memberId, followingId);
    }
    async unsubscribe(input, memberId) {
        console.log('Mutation: unsubscribe');
        const followingId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.followService.unsubscribe(memberId, followingId);
    }
    async getMemberFollowings(input, memberId) {
        console.log('Query: getMemberFollowings');
        const { followerId } = input.search;
        input.search.followerId = (0, config_1.shapeIntoMongoObjectId)(followerId);
        return await this.followService.getMemberFollowings(memberId, input);
    }
    async getMemberFollowers(input, memberId) {
        console.log('Query: getMemberFollowers');
        const { followingId } = input.search;
        input.search.followingId = (0, config_1.shapeIntoMongoObjectId)(followingId);
        return await this.followService.getMemberFollowers(memberId, input);
    }
};
exports.FollowResolver = FollowResolver;
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)((returns) => follow_1.Follower),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], FollowResolver.prototype, "subscribe", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)((returns) => follow_1.Follower),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], FollowResolver.prototype, "unsubscribe", null);
__decorate([
    (0, common_1.UseGuards)(without_guard_1.WithoutGuard),
    (0, graphql_1.Query)((returns) => follow_1.Followings),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof follow_input_1.FollowInquiry !== "undefined" && follow_input_1.FollowInquiry) === "function" ? _d : Object, Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], FollowResolver.prototype, "getMemberFollowings", null);
__decorate([
    (0, common_1.UseGuards)(without_guard_1.WithoutGuard),
    (0, graphql_1.Query)((returns) => follow_1.Followers),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof follow_input_1.FollowInquiry !== "undefined" && follow_input_1.FollowInquiry) === "function" ? _f : Object, Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], FollowResolver.prototype, "getMemberFollowers", null);
exports.FollowResolver = FollowResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [typeof (_a = typeof follow_service_1.FollowService !== "undefined" && follow_service_1.FollowService) === "function" ? _a : Object])
], FollowResolver);


/***/ }),

/***/ "./apps/nestar-api/src/components/follow/follow.service.ts":
/*!*****************************************************************!*\
  !*** ./apps/nestar-api/src/components/follow/follow.service.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FollowService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const member_service_1 = __webpack_require__(/*! ../member/member.service */ "./apps/nestar-api/src/components/member/member.service.ts");
const mongoose_2 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const common_enum_1 = __webpack_require__(/*! ../../libs/enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
let FollowService = class FollowService {
    followModel;
    memberService;
    constructor(followModel, memberService) {
        this.followModel = followModel;
        this.memberService = memberService;
    }
    async subscribe(followerId, followingId) {
        if (followerId.toString() === followingId.toString()) {
            throw new common_1.InternalServerErrorException(common_enum_1.Message.SELF_SUBSCRIPTION_DENIED);
        }
        const targetMember = await this.memberService.getMember(null, followingId);
        if (!targetMember)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        const result = await this.registerSubscription(followerId, followingId);
        await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowings', modifier: 1 });
        await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowers', modifier: 1 });
        return result;
    }
    async registerSubscription(followerId, followingId) {
        try {
            return await this.followModel.create({
                followingId: followingId,
                followerId: followerId,
            });
        }
        catch (err) {
            console.log('Error, Service.model:', err instanceof Error ? err.message : err);
            throw new common_1.BadRequestException(common_enum_1.Message.CREATE_FAILED);
        }
    }
    async unsubscribe(followerId, followingId) {
        const targetMember = await this.memberService.getMember(null, followingId);
        if (!targetMember)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        const result = await this.followModel.findOneAndDelete({
            followingId: followingId,
            followerId: followerId,
        });
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowings', modifier: -1 });
        await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowers', modifier: -1 });
        return result;
    }
    async getMemberFollowings(memberId, input) {
        const { page, limit, search } = input;
        if (!search?.followerId)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.BAD_REQUEST);
        const match = { followerId: search?.followerId };
        console.log('match:', match);
        const result = await this.followModel
            .aggregate([
            { $match: match },
            { $sort: { createdAt: common_enum_1.Direction.DESC } },
            {
                $facet: {
                    list: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        (0, config_1.lookupAuthMemberLiked)(memberId, "$followingId"),
                        (0, config_1.lookupAuthMemberFollowed)({
                            followerId: memberId, followingId: '$followingId'
                        }),
                        config_1.lookupFollowingData,
                        { $unwind: '$followingData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        if (!result.length)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        return result[0];
    }
    async getMemberFollowers(memberId, input) {
        const { page, limit, search } = input;
        if (!search?.followingId)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.BAD_REQUEST);
        const match = { followingId: search?.followingId };
        console.log('match:', match);
        const result = await this.followModel
            .aggregate([
            { $match: match },
            { $sort: { createdAt: common_enum_1.Direction.DESC } },
            {
                $facet: {
                    list: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        (0, config_1.lookupAuthMemberLiked)(memberId, "$followerId"),
                        (0, config_1.lookupAuthMemberFollowed)({
                            followerId: memberId, followingId: '$followerId'
                        }),
                        config_1.lookupFollowerData,
                        { $unwind: '$followerData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        if (!result.length)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        return result[0];
    }
};
exports.FollowService = FollowService;
exports.FollowService = FollowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)('Follow')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_1.Model !== "undefined" && mongoose_1.Model) === "function" ? _a : Object, typeof (_b = typeof member_service_1.MemberService !== "undefined" && member_service_1.MemberService) === "function" ? _b : Object])
], FollowService);


/***/ }),

/***/ "./apps/nestar-api/src/components/like/like.module.ts":
/*!************************************************************!*\
  !*** ./apps/nestar-api/src/components/like/like.module.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LikeModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const Like_model_1 = __importDefault(__webpack_require__(/*! ../../schemas/Like.model */ "./apps/nestar-api/src/schemas/Like.model.ts"));
const like_service_1 = __webpack_require__(/*! ./like.service */ "./apps/nestar-api/src/components/like/like.service.ts");
let LikeModule = class LikeModule {
};
exports.LikeModule = LikeModule;
exports.LikeModule = LikeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: "Like",
                    schema: Like_model_1.default,
                },
            ]),
        ],
        providers: [like_service_1.LikeService],
        exports: [like_service_1.LikeService]
    })
], LikeModule);


/***/ }),

/***/ "./apps/nestar-api/src/components/like/like.service.ts":
/*!*************************************************************!*\
  !*** ./apps/nestar-api/src/components/like/like.service.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LikeService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const common_enum_1 = __webpack_require__(/*! ../../libs/enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
const like_enum_1 = __webpack_require__(/*! ../../libs/enums/like.enum */ "./apps/nestar-api/src/libs/enums/like.enum.ts");
let LikeService = class LikeService {
    likeModel;
    constructor(likeModel) {
        this.likeModel = likeModel;
    }
    async toggleLike(input) {
        const search = { memberId: input.memberId, likeRefId: input.likeRefId }, exist = await this.likeModel.findOne(search).exec();
        let modifier = 1;
        if (exist) {
            await this.likeModel.findOneAndDelete(search).exec();
            modifier = -1;
        }
        else {
            try {
                await this.likeModel.create(input);
            }
            catch (err) {
                console.log('Error, Service.model:', err instanceof Error ? err.message : err);
                throw new common_1.BadRequestException(common_enum_1.Message.CREATE_FAILED);
            }
        }
        console.log(`- Like modifier ${modifier} -`);
        return modifier;
    }
    async checkLikeExistence(input) {
        const { memberId, likeRefId } = input;
        const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
        return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
    }
    async getFavoriteProperties(memberId, input) {
        const { page, limit } = input;
        const match = { likeGroup: like_enum_1.LikeGroup.PROPERTY, memberId: memberId };
        const data = await this.likeModel
            .aggregate([
            { $match: match },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: 'properties',
                    localField: 'likeRefId',
                    foreignField: '_id',
                    as: 'favoriteProperty',
                },
            },
            { $unwind: '$favoriteProperty' },
            {
                $facet: {
                    list: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        config_1.lookupFavorite,
                        { $unwind: '$favoriteProperty.memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        const result = { list: [], metaCounter: data[0].metaCounter };
        result.list = data[0].list.map((ele) => ele.favoriteProperty);
        console.log('result:', result);
        return result;
    }
};
exports.LikeService = LikeService;
exports.LikeService = LikeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Like')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], LikeService);


/***/ }),

/***/ "./apps/nestar-api/src/components/member/member.module.ts":
/*!****************************************************************!*\
  !*** ./apps/nestar-api/src/components/member/member.module.ts ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MemberModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const member_resolver_1 = __webpack_require__(/*! ./member.resolver */ "./apps/nestar-api/src/components/member/member.resolver.ts");
const member_service_1 = __webpack_require__(/*! ./member.service */ "./apps/nestar-api/src/components/member/member.service.ts");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const Member_model_1 = __importDefault(__webpack_require__(/*! ../../schemas/Member.model */ "./apps/nestar-api/src/schemas/Member.model.ts"));
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./apps/nestar-api/src/components/auth/auth.module.ts");
const view_module_1 = __webpack_require__(/*! ../view/view.module */ "./apps/nestar-api/src/components/view/view.module.ts");
const like_module_1 = __webpack_require__(/*! ../like/like.module */ "./apps/nestar-api/src/components/like/like.module.ts");
const Follow_model_1 = __importDefault(__webpack_require__(/*! ../../schemas/Follow.model */ "./apps/nestar-api/src/schemas/Follow.model.ts"));
let MemberModule = class MemberModule {
};
exports.MemberModule = MemberModule;
exports.MemberModule = MemberModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: "Member",
                    schema: Member_model_1.default
                },
            ]),
            mongoose_1.MongooseModule.forFeature([
                {
                    name: "Follow",
                    schema: Follow_model_1.default
                },
            ]),
            auth_module_1.AuthModule,
            view_module_1.ViewModule,
            like_module_1.LikeModule,
        ],
        providers: [member_resolver_1.MemberResolver, member_service_1.MemberService],
        exports: [member_service_1.MemberService],
    })
], MemberModule);


/***/ }),

/***/ "./apps/nestar-api/src/components/member/member.resolver.ts":
/*!******************************************************************!*\
  !*** ./apps/nestar-api/src/components/member/member.resolver.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MemberResolver = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const member_service_1 = __webpack_require__(/*! ./member.service */ "./apps/nestar-api/src/components/member/member.service.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const member_input_1 = __webpack_require__(/*! ../../libs/dto/member/member.input */ "./apps/nestar-api/src/libs/dto/member/member.input.ts");
const member_1 = __webpack_require__(/*! ../../libs/dto/member/member */ "./apps/nestar-api/src/libs/dto/member/member.ts");
const auth_guard_1 = __webpack_require__(/*! ../auth/guards/auth.guard */ "./apps/nestar-api/src/components/auth/guards/auth.guard.ts");
const authMember_decorator_1 = __webpack_require__(/*! ../auth/decorators/authMember.decorator */ "./apps/nestar-api/src/components/auth/decorators/authMember.decorator.ts");
const roles_decorator_1 = __webpack_require__(/*! ../auth/decorators/roles.decorator */ "./apps/nestar-api/src/components/auth/decorators/roles.decorator.ts");
const member_enum_1 = __webpack_require__(/*! ../../libs/enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const roles_guard_1 = __webpack_require__(/*! ../auth/guards/roles.guard */ "./apps/nestar-api/src/components/auth/guards/roles.guard.ts");
const member_update_1 = __webpack_require__(/*! ../../libs/dto/member/member.update */ "./apps/nestar-api/src/libs/dto/member/member.update.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
const without_guard_1 = __webpack_require__(/*! ../auth/guards/without.guard */ "./apps/nestar-api/src/components/auth/guards/without.guard.ts");
const graphql_upload_1 = __webpack_require__(/*! graphql-upload */ "graphql-upload");
const fs_1 = __webpack_require__(/*! fs */ "fs");
const common_enum_1 = __webpack_require__(/*! ../../libs/enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
let MemberResolver = class MemberResolver {
    memberService;
    constructor(memberService) {
        this.memberService = memberService;
    }
    async signup(input) {
        console.log('Mutation: signup');
        return await this.memberService.signup(input);
    }
    async login(input) {
        console.log('Mutation: login');
        return await this.memberService.login(input);
    }
    async checkAuth(memberNick) {
        console.log('Query: checkAuth');
        console.log('memberNick:', memberNick);
        return `Hi ${memberNick}`;
    }
    async checkAuthRoles(authMember) {
        console.log('Query: checkAuthRoles');
        return `Hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
    }
    async updateMember(input, memberId) {
        console.log('Mutation: updateMember');
        delete input._id;
        return await this.memberService.updateMember(memberId, input);
    }
    async getMember(input, memberId) {
        console.log('Query: getMember');
        const targetId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.memberService.getMember(memberId, targetId);
    }
    async getAgents(input, memberId) {
        console.log('Query: getAgents');
        return await this.memberService.getAgents(memberId, input);
    }
    async likeTargetMember(input, memberId) {
        console.log('Mutation: likeTargetMember');
        const likeRefId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.memberService.likeTargetMember(memberId, likeRefId);
    }
    async getAllMembersByAdmin(input) {
        console.log('Query: getAllMembersByAdmin');
        return await this.memberService.getAllMembersByAdmin(input);
    }
    async updateMemberByAdmin(input) {
        console.log('Mutation: updateMemberByAdmin');
        return await this.memberService.updateMemberByAdmin(input);
    }
    async imageUploader({ createReadStream, filename, mimetype }, target) {
        console.log('Mutation: imageUploader');
        if (!filename)
            throw new Error(common_enum_1.Message.UPLOAD_FAILED);
        const validMime = config_1.validMimeTypes.includes(mimetype);
        if (!validMime)
            throw new Error(common_enum_1.Message.PROVIDE_ALLOWED_FORMAT);
        const imageName = (0, config_1.getSerialForImage)(filename);
        const url = `uploads/${target}/${imageName}`;
        const stream = createReadStream();
        const result = await new Promise((resolve, reject) => {
            stream
                .pipe((0, fs_1.createWriteStream)(url))
                .on('finish', async () => resolve(true))
                .on('error', () => reject(false));
        });
        if (!result)
            throw new Error(common_enum_1.Message.UPLOAD_FAILED);
        return url;
    }
    async imagesUploader(files, target) {
        console.log('Mutation: imagesUploader');
        const uploadedImages = [];
        const promisedList = files.map(async (img, index) => {
            try {
                const { filename, mimetype, encoding, createReadStream } = await img;
                const validMime = config_1.validMimeTypes.includes(mimetype);
                if (!validMime)
                    throw new Error(common_enum_1.Message.PROVIDE_ALLOWED_FORMAT);
                const imageName = (0, config_1.getSerialForImage)(filename);
                const url = `uploads/${target}/${imageName}`;
                const stream = createReadStream();
                const result = await new Promise((resolve, reject) => {
                    stream
                        .pipe((0, fs_1.createWriteStream)(url))
                        .on('finish', () => resolve(true))
                        .on('error', () => reject(false));
                });
                if (!result)
                    throw new Error(common_enum_1.Message.UPLOAD_FAILED);
                uploadedImages[index] = url;
            }
            catch (err) {
                console.log('Error, file missing!');
            }
        });
        await Promise.all(promisedList);
        return uploadedImages;
    }
};
exports.MemberResolver = MemberResolver;
__decorate([
    (0, graphql_1.Mutation)(() => member_1.Member),
    __param(0, (0, graphql_1.Args)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof member_input_1.MemberInput !== "undefined" && member_input_1.MemberInput) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], MemberResolver.prototype, "signup", null);
__decorate([
    (0, graphql_1.Mutation)(() => member_1.Member),
    __param(0, (0, graphql_1.Args)("input")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof member_input_1.LoginInput !== "undefined" && member_input_1.LoginInput) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], MemberResolver.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Query)(() => String),
    __param(0, (0, authMember_decorator_1.AuthMember)('memberNick')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], MemberResolver.prototype, "checkAuth", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.USER, member_enum_1.MemberType.AGENT, member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Query)(() => String),
    __param(0, (0, authMember_decorator_1.AuthMember)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof member_1.Member !== "undefined" && member_1.Member) === "function" ? _g : Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], MemberResolver.prototype, "checkAuthRoles", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)(() => member_1.Member),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof member_update_1.MemberUpdate !== "undefined" && member_update_1.MemberUpdate) === "function" ? _j : Object, Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], MemberResolver.prototype, "updateMember", null);
__decorate([
    (0, common_1.UseGuards)(without_guard_1.WithoutGuard),
    (0, graphql_1.Query)(() => member_1.Member),
    __param(0, (0, graphql_1.Args)('memberId')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], MemberResolver.prototype, "getMember", null);
__decorate([
    (0, common_1.UseGuards)(without_guard_1.WithoutGuard),
    (0, graphql_1.Query)(() => member_1.Members),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_m = typeof member_input_1.AgentsInquiry !== "undefined" && member_input_1.AgentsInquiry) === "function" ? _m : Object, Object]),
    __metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], MemberResolver.prototype, "getAgents", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)(() => member_1.Member),
    __param(0, (0, graphql_1.Args)('memberId')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], MemberResolver.prototype, "likeTargetMember", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Query)(() => member_1.Members),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_q = typeof member_input_1.MembersInquiry !== "undefined" && member_input_1.MembersInquiry) === "function" ? _q : Object]),
    __metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], MemberResolver.prototype, "getAllMembersByAdmin", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Mutation)(() => member_1.Member),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_s = typeof member_update_1.MemberUpdate !== "undefined" && member_update_1.MemberUpdate) === "function" ? _s : Object]),
    __metadata("design:returntype", typeof (_t = typeof Promise !== "undefined" && Promise) === "function" ? _t : Object)
], MemberResolver.prototype, "updateMemberByAdmin", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)((returns) => String),
    __param(0, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_1.GraphQLUpload })),
    __param(1, (0, graphql_1.Args)('target')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_u = typeof graphql_upload_1.FileUpload !== "undefined" && graphql_upload_1.FileUpload) === "function" ? _u : Object, typeof (_v = typeof String !== "undefined" && String) === "function" ? _v : Object]),
    __metadata("design:returntype", typeof (_w = typeof Promise !== "undefined" && Promise) === "function" ? _w : Object)
], MemberResolver.prototype, "imageUploader", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)((returns) => [String]),
    __param(0, (0, graphql_1.Args)('files', { type: () => [graphql_upload_1.GraphQLUpload] })),
    __param(1, (0, graphql_1.Args)('target')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, typeof (_x = typeof String !== "undefined" && String) === "function" ? _x : Object]),
    __metadata("design:returntype", typeof (_y = typeof Promise !== "undefined" && Promise) === "function" ? _y : Object)
], MemberResolver.prototype, "imagesUploader", null);
exports.MemberResolver = MemberResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [typeof (_a = typeof member_service_1.MemberService !== "undefined" && member_service_1.MemberService) === "function" ? _a : Object])
], MemberResolver);


/***/ }),

/***/ "./apps/nestar-api/src/components/member/member.service.ts":
/*!*****************************************************************!*\
  !*** ./apps/nestar-api/src/components/member/member.service.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MemberService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const member_enum_1 = __webpack_require__(/*! ../../libs/enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const common_enum_1 = __webpack_require__(/*! ../../libs/enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
const auth_service_1 = __webpack_require__(/*! ../auth/auth.service */ "./apps/nestar-api/src/components/auth/auth.service.ts");
const view_service_1 = __webpack_require__(/*! ../view/view.service */ "./apps/nestar-api/src/components/view/view.service.ts");
const view_enum_1 = __webpack_require__(/*! ../../libs/enums/view.enum */ "./apps/nestar-api/src/libs/enums/view.enum.ts");
const like_enum_1 = __webpack_require__(/*! ../../libs/enums/like.enum */ "./apps/nestar-api/src/libs/enums/like.enum.ts");
const like_service_1 = __webpack_require__(/*! ../like/like.service */ "./apps/nestar-api/src/components/like/like.service.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
let MemberService = class MemberService {
    memberModel;
    followModel;
    authService;
    viewService;
    likeService;
    constructor(memberModel, followModel, authService, viewService, likeService) {
        this.memberModel = memberModel;
        this.followModel = followModel;
        this.authService = authService;
        this.viewService = viewService;
        this.likeService = likeService;
    }
    async signup(input) {
        input.memberPassword = await this.authService.hashPassword(input.memberPassword);
        try {
            const result = await this.memberModel.create(input);
            result.accessToken = await this.authService.createToken(result);
            return result;
        }
        catch (err) {
            if (err instanceof Error) {
                console.log("Error, Service.model", err.message);
            }
            throw new common_1.BadRequestException(common_enum_1.Message.USED_MEMBER_NICK_OR_PHONE);
        }
    }
    async login(input) {
        const { memberNick, memberPassword } = input;
        const response = await this.memberModel
            .findOne({ memberNick: memberNick })
            .select("+memberPassword")
            .exec();
        if (!response || response.memberStatus === member_enum_1.MemberStatus.DELETE) {
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_MEMBER_NICK);
        }
        else if (response.memberStatus === member_enum_1.MemberStatus.BLOCK) {
            throw new common_1.InternalServerErrorException(common_enum_1.Message.BLOCKED_USER);
        }
        const isMatch = await this.authService.comparePasswords(input.memberPassword, response.memberPassword);
        if (!isMatch)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.WRONG_PASSWORD);
        response.accessToken = await this.authService.createToken(response);
        return response;
    }
    async updateMember(memberId, input) {
        const result = await this.memberModel.findOneAndUpdate({
            _id: memberId,
            memberStatus: member_enum_1.MemberStatus.ACTIVE,
        }, input, { new: true })
            .exec();
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.UPDATE_FAILED);
        result.accessToken = await this.authService.createToken(result);
        return result;
    }
    async getMember(memberId, targetId) {
        const search = {
            _id: targetId,
            memberStatus: {
                $in: [member_enum_1.MemberStatus.ACTIVE, member_enum_1.MemberStatus.BLOCK],
            },
        };
        const targetMember = await this.memberModel.findOne(search).lean().exec();
        if (!targetMember)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        if (memberId) {
            const viewInput = { memberId: memberId, viewRefId: targetId, viewGroup: view_enum_1.ViewGroup.MEMBER };
            const newView = await this.viewService.recordView(viewInput);
            if (newView) {
                await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
                targetMember.memberViews++;
            }
            const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: like_enum_1.LikeGroup.MEMBER };
            targetMember.meLiked = (await this.likeService.checkLikeExistence(likeInput));
            targetMember.meFollowed = (await this.checkSubscription(memberId, targetId));
        }
        return targetMember;
    }
    async checkSubscription(followerId, followingId) {
        const result = await this.followModel.findOne({ followingId: followingId, followerId: followerId }).exec();
        return result ? [{ followerId: followerId, followingId: followingId, myFollowing: true }] : [];
    }
    async getAgents(memberId, input) {
        const { text } = input.search;
        const match = { memberType: member_enum_1.MemberType.AGENT, memberStatus: member_enum_1.MemberStatus.ACTIVE };
        const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? common_enum_1.Direction.DESC };
        if (text)
            match.memberNick = { $regex: new RegExp(text, 'i') };
        console.log('match:', match);
        const result = await this.memberModel
            .aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        (0, config_1.lookupAuthMemberLiked)(memberId),
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        if (!result.length)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        return result[0];
    }
    async likeTargetMember(memberId, likeRefId) {
        const target = await this.memberModel.findOne({ _id: likeRefId, memberStatus: member_enum_1.MemberStatus.ACTIVE }).exec();
        if (!target)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        const input = {
            memberId: memberId,
            likeRefId: likeRefId,
            likeGroup: like_enum_1.LikeGroup.MEMBER,
        };
        const modifier = await this.likeService.toggleLike(input);
        const result = await this.memberStatsEditor({ _id: likeRefId, targetKey: 'memberLikes', modifier: modifier });
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.SOMETHING_WENT_WRONG);
        return result;
    }
    async getAllMembersByAdmin(input) {
        const { memberStatus, memberType, text } = input.search;
        const match = {};
        const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? common_enum_1.Direction.DESC };
        if (memberStatus)
            match.memberStatus = memberStatus;
        if (memberType)
            match.memberType = memberType;
        if (text)
            match.memberNick = { $regex: new RegExp(text, 'i') };
        console.log('match:', match);
        const result = await this.memberModel
            .aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        if (!result.length) {
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        }
        return result[0];
    }
    async updateMemberByAdmin(input) {
        const result = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.UPDATE_FAILED);
        return result;
    }
    async memberStatsEditor(input) {
        console.log('executed');
        const { _id, targetKey, modifier } = input;
        const result = await this.memberModel
            .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
            .exec();
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.UPDATE_FAILED);
        return result;
    }
};
exports.MemberService = MemberService;
exports.MemberService = MemberService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Member')),
    __param(1, (0, mongoose_1.InjectModel)('Follow')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _b : Object, typeof (_c = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _c : Object, typeof (_d = typeof view_service_1.ViewService !== "undefined" && view_service_1.ViewService) === "function" ? _d : Object, typeof (_e = typeof like_service_1.LikeService !== "undefined" && like_service_1.LikeService) === "function" ? _e : Object])
], MemberService);


/***/ }),

/***/ "./apps/nestar-api/src/components/property/property.module.ts":
/*!********************************************************************!*\
  !*** ./apps/nestar-api/src/components/property/property.module.ts ***!
  \********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropertyModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const property_service_1 = __webpack_require__(/*! ./property.service */ "./apps/nestar-api/src/components/property/property.service.ts");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const Property_model_1 = __importDefault(__webpack_require__(/*! ../../schemas/Property.model */ "./apps/nestar-api/src/schemas/Property.model.ts"));
const auth_module_1 = __webpack_require__(/*! ../auth/auth.module */ "./apps/nestar-api/src/components/auth/auth.module.ts");
const view_module_1 = __webpack_require__(/*! ../view/view.module */ "./apps/nestar-api/src/components/view/view.module.ts");
const property_resolver_1 = __webpack_require__(/*! ./property.resolver */ "./apps/nestar-api/src/components/property/property.resolver.ts");
const member_module_1 = __webpack_require__(/*! ../member/member.module */ "./apps/nestar-api/src/components/member/member.module.ts");
const like_module_1 = __webpack_require__(/*! ../like/like.module */ "./apps/nestar-api/src/components/like/like.module.ts");
let PropertyModule = class PropertyModule {
};
exports.PropertyModule = PropertyModule;
exports.PropertyModule = PropertyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: "Property",
                    schema: Property_model_1.default,
                },
            ]),
            auth_module_1.AuthModule,
            view_module_1.ViewModule,
            member_module_1.MemberModule,
            like_module_1.LikeModule,
        ],
        providers: [property_resolver_1.PropertyResolver, property_service_1.PropertyService],
        exports: [property_service_1.PropertyService]
    })
], PropertyModule);


/***/ }),

/***/ "./apps/nestar-api/src/components/property/property.resolver.ts":
/*!**********************************************************************!*\
  !*** ./apps/nestar-api/src/components/property/property.resolver.ts ***!
  \**********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropertyResolver = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const property_service_1 = __webpack_require__(/*! ./property.service */ "./apps/nestar-api/src/components/property/property.service.ts");
const property_1 = __webpack_require__(/*! ../../libs/dto/property/property */ "./apps/nestar-api/src/libs/dto/property/property.ts");
const property_input_1 = __webpack_require__(/*! ../../libs/dto/property/property.input */ "./apps/nestar-api/src/libs/dto/property/property.input.ts");
const member_enum_1 = __webpack_require__(/*! ../../libs/enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const roles_decorator_1 = __webpack_require__(/*! ../auth/decorators/roles.decorator */ "./apps/nestar-api/src/components/auth/decorators/roles.decorator.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const roles_guard_1 = __webpack_require__(/*! ../auth/guards/roles.guard */ "./apps/nestar-api/src/components/auth/guards/roles.guard.ts");
const authMember_decorator_1 = __webpack_require__(/*! ../auth/decorators/authMember.decorator */ "./apps/nestar-api/src/components/auth/decorators/authMember.decorator.ts");
const without_guard_1 = __webpack_require__(/*! ../auth/guards/without.guard */ "./apps/nestar-api/src/components/auth/guards/without.guard.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
const property_update_1 = __webpack_require__(/*! ../../libs/dto/property/property.update */ "./apps/nestar-api/src/libs/dto/property/property.update.ts");
const auth_guard_1 = __webpack_require__(/*! ../auth/guards/auth.guard */ "./apps/nestar-api/src/components/auth/guards/auth.guard.ts");
let PropertyResolver = class PropertyResolver {
    propertyService;
    constructor(propertyService) {
        this.propertyService = propertyService;
    }
    async createProperty(input, memberId) {
        console.log('Mutation createProperty');
        input.memberId = memberId;
        return await this.propertyService.createProperty(input);
    }
    async getProperty(input, memberId) {
        console.log('Query: getProperty');
        const propertyId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.propertyService.getProperty(memberId, propertyId);
    }
    async updateProperty(input, memberId) {
        console.log('Mutation: updateProperty');
        input._id = (0, config_1.shapeIntoMongoObjectId)(input._id);
        return await this.propertyService.updateProperty(memberId, input);
    }
    async getProperties(input, memberId) {
        console.log('Query: getProperties');
        return await this.propertyService.getProperties(memberId, input);
    }
    async getFavorites(input, memberId) {
        console.log('Query: getFavorites');
        return await this.propertyService.getFavorites(memberId, input);
    }
    async getVisited(input, memberId) {
        console.log('Query: getVisited');
        return await this.propertyService.getVisited(memberId, input);
    }
    async getAgentProperties(input, memberId) {
        console.log('Query: getAgentProperties');
        return await this.propertyService.getAgentProperties(memberId, input);
    }
    async likeTargetProperty(input, memberId) {
        console.log('Mutation: likeTargetProperty');
        const likeRefId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.propertyService.likeTargetProperty(memberId, likeRefId);
    }
    async getAllPropertiesByAdmin(input, memberId) {
        console.log('Query: getAllPropertiesByAdmin');
        return await this.propertyService.getAllPropertiesByAdmin(input);
    }
    async updatePropertyByAdmin(input) {
        console.log('Mutation: updatePropertyByAdmin');
        input._id = (0, config_1.shapeIntoMongoObjectId)(input._id);
        return await this.propertyService.updatePropertyByAdmin(input);
    }
    async removePropertyByAdmin(input) {
        console.log('Mutation: removePropertyByAdmin');
        const propertyId = (0, config_1.shapeIntoMongoObjectId)(input);
        return await this.propertyService.removePropertyByAdmin(propertyId);
    }
};
exports.PropertyResolver = PropertyResolver;
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.AGENT),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Mutation)(() => property_1.Property),
    __param(0, (0, graphql_1.Args)("input")),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof property_input_1.PropertyInput !== "undefined" && property_input_1.PropertyInput) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], PropertyResolver.prototype, "createProperty", null);
__decorate([
    (0, common_1.UseGuards)(without_guard_1.WithoutGuard),
    (0, graphql_1.Query)((returns) => property_1.Property),
    __param(0, (0, graphql_1.Args)('propertyId')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], PropertyResolver.prototype, "getProperty", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.AGENT),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Mutation)((returns) => property_1.Property),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof property_update_1.PropertyUpdate !== "undefined" && property_update_1.PropertyUpdate) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], PropertyResolver.prototype, "updateProperty", null);
__decorate([
    (0, common_1.UseGuards)(without_guard_1.WithoutGuard),
    (0, graphql_1.Query)((returns) => property_1.Properties),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_g = typeof property_input_1.PropertiesInquiry !== "undefined" && property_input_1.PropertiesInquiry) === "function" ? _g : Object, Object]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], PropertyResolver.prototype, "getProperties", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Query)((returns) => property_1.Properties),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_j = typeof property_input_1.OrdinaryInquiry !== "undefined" && property_input_1.OrdinaryInquiry) === "function" ? _j : Object, Object]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], PropertyResolver.prototype, "getFavorites", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Query)((returns) => property_1.Properties),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_l = typeof property_input_1.OrdinaryInquiry !== "undefined" && property_input_1.OrdinaryInquiry) === "function" ? _l : Object, Object]),
    __metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], PropertyResolver.prototype, "getVisited", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.AGENT),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Query)((returns) => property_1.Properties),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_o = typeof property_input_1.AgentPropertiesInquiry !== "undefined" && property_input_1.AgentPropertiesInquiry) === "function" ? _o : Object, Object]),
    __metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], PropertyResolver.prototype, "getAgentProperties", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, graphql_1.Mutation)(() => property_1.Property),
    __param(0, (0, graphql_1.Args)('propertyId')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], PropertyResolver.prototype, "likeTargetProperty", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Query)((returns) => property_1.Properties),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, authMember_decorator_1.AuthMember)('_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_r = typeof property_input_1.AllPropertiesInquiry !== "undefined" && property_input_1.AllPropertiesInquiry) === "function" ? _r : Object, Object]),
    __metadata("design:returntype", typeof (_s = typeof Promise !== "undefined" && Promise) === "function" ? _s : Object)
], PropertyResolver.prototype, "getAllPropertiesByAdmin", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Mutation)((returns) => property_1.Property),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_t = typeof property_update_1.PropertyUpdate !== "undefined" && property_update_1.PropertyUpdate) === "function" ? _t : Object]),
    __metadata("design:returntype", typeof (_u = typeof Promise !== "undefined" && Promise) === "function" ? _u : Object)
], PropertyResolver.prototype, "updatePropertyByAdmin", null);
__decorate([
    (0, roles_decorator_1.Roles)(member_enum_1.MemberType.ADMIN),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, graphql_1.Mutation)((returns) => property_1.Property),
    __param(0, (0, graphql_1.Args)('propertyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_v = typeof Promise !== "undefined" && Promise) === "function" ? _v : Object)
], PropertyResolver.prototype, "removePropertyByAdmin", null);
exports.PropertyResolver = PropertyResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [typeof (_a = typeof property_service_1.PropertyService !== "undefined" && property_service_1.PropertyService) === "function" ? _a : Object])
], PropertyResolver);


/***/ }),

/***/ "./apps/nestar-api/src/components/property/property.service.ts":
/*!*********************************************************************!*\
  !*** ./apps/nestar-api/src/components/property/property.service.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropertyService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const common_enum_1 = __webpack_require__(/*! ../../libs/enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
const member_service_1 = __webpack_require__(/*! ../member/member.service */ "./apps/nestar-api/src/components/member/member.service.ts");
const property_enum_1 = __webpack_require__(/*! ../../libs/enums/property.enum */ "./apps/nestar-api/src/libs/enums/property.enum.ts");
const view_enum_1 = __webpack_require__(/*! ../../libs/enums/view.enum */ "./apps/nestar-api/src/libs/enums/view.enum.ts");
const view_service_1 = __webpack_require__(/*! ../view/view.service */ "./apps/nestar-api/src/components/view/view.service.ts");
const moment_1 = __importDefault(__webpack_require__(/*! moment */ "moment"));
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
const like_service_1 = __webpack_require__(/*! ../like/like.service */ "./apps/nestar-api/src/components/like/like.service.ts");
const like_enum_1 = __webpack_require__(/*! ../../libs/enums/like.enum */ "./apps/nestar-api/src/libs/enums/like.enum.ts");
let PropertyService = class PropertyService {
    propertyModel;
    memberService;
    viewService;
    likeService;
    constructor(propertyModel, memberService, viewService, likeService) {
        this.propertyModel = propertyModel;
        this.memberService = memberService;
        this.viewService = viewService;
        this.likeService = likeService;
    }
    async createProperty(input) {
        try {
            const result = await this.propertyModel.create(input);
            await this.memberService.memberStatsEditor({
                _id: result.memberId,
                targetKey: 'memberProperties',
                modifier: 1,
            });
            return result;
        }
        catch (err) {
            console.log('Error, Service.model:', err instanceof Error ? err.message : err);
            throw new common_1.BadRequestException(common_enum_1.Message.CREATE_FAILED);
        }
    }
    async getProperty(memberId, propertyId) {
        const search = {
            _id: propertyId,
            propertyStatus: property_enum_1.PropertyStatus.ACTIVE,
        };
        const targetProperty = await this.propertyModel.findOne(search).lean().exec();
        if (!targetProperty)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        if (memberId) {
            const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: view_enum_1.ViewGroup.PROPERTY };
            const newView = await this.viewService.recordView(viewInput);
            if (newView) {
                await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
                targetProperty.propertyViews++;
            }
            const likeInput = { memberId: memberId, likeRefId: propertyId, likeGroup: like_enum_1.LikeGroup.PROPERTY };
            targetProperty.meLiked = await this.likeService.checkLikeExistence(likeInput);
            targetProperty.meLiked;
        }
        targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);
        return targetProperty;
    }
    async updateProperty(memberId, input) {
        let { propertyStatus, soldAt, deletedAt } = input;
        const search = {
            _id: input._id,
            memberId: memberId,
            propertyStatus: property_enum_1.PropertyStatus.ACTIVE,
        };
        if (propertyStatus === property_enum_1.PropertyStatus.SOLD)
            soldAt = (0, moment_1.default)().toDate();
        else if (propertyStatus === property_enum_1.PropertyStatus.DELETE)
            deletedAt = (0, moment_1.default)().toDate();
        const result = await this.propertyModel
            .findOneAndUpdate(search, input, {
            new: true,
        })
            .exec();
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.UPDATE_FAILED);
        if (soldAt || deletedAt) {
            await this.memberService.memberStatsEditor({
                _id: memberId,
                targetKey: 'memberProperties',
                modifier: -1,
            });
        }
        return result;
    }
    async getProperties(memberId, input) {
        const match = { propertyStatus: property_enum_1.PropertyStatus.ACTIVE };
        const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? common_enum_1.Direction.DESC };
        this.shapeMatchQuery(match, input);
        console.log('match:', match);
        const result = await this.propertyModel
            .aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        (0, config_1.lookupAuthMemberLiked)(memberId),
                        config_1.lookupMember,
                        { $unwind: '$memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        if (!result.length)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        return result[0];
    }
    shapeMatchQuery(match, input) {
        const { memberId, locationList, roomsList, bedsList, typeList, periodsRange, pricesRange, squaresRange, options, text, } = input.search;
        if (memberId)
            match.memberId = (0, config_1.shapeIntoMongoObjectId)(memberId);
        if (locationList && locationList.length)
            match.propertyLocation = { $in: locationList };
        if (roomsList && roomsList.length)
            match.propertyRooms = { $in: roomsList };
        if (bedsList && bedsList.length)
            match.propertyBeds = { $in: bedsList };
        if (typeList && typeList.length)
            match.propertyType = { $in: typeList };
        if (pricesRange)
            match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
        if (periodsRange)
            match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
        if (squaresRange)
            match.propertySquare = { $gte: squaresRange.start, $lte: squaresRange.end };
        if (text)
            match.propertyTitle = { $regex: new RegExp(text, 'i') };
        if (options) {
            match['$or'] = options.map((ele) => {
                return { [ele]: true };
            });
        }
    }
    async getFavorites(memberId, input) {
        return await this.likeService.getFavoriteProperties(memberId, input);
    }
    async getVisited(memberId, input) {
        return await this.viewService.getVisitedProperties(memberId, input);
    }
    async getAgentProperties(memberId, input) {
        const { propertyStatus } = input.search;
        if (propertyStatus === property_enum_1.PropertyStatus.DELETE)
            throw new common_1.BadRequestException(common_enum_1.Message.NOT_ALLOWED_REQUEST);
        const match = {
            memberId: memberId,
            propertyStatus: propertyStatus ?? { $ne: property_enum_1.PropertyStatus.DELETE },
        };
        const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? common_enum_1.Direction.DESC };
        const result = await this.propertyModel
            .aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        config_1.lookupMember,
                        { $unwind: '$memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        if (!result.length)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        return result[0];
    }
    async likeTargetProperty(memberId, likeRefId) {
        const target = await this.propertyModel
            .findOne({ _id: likeRefId, propertyStatus: property_enum_1.PropertyStatus.ACTIVE })
            .exec();
        if (!target)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        const input = {
            memberId: memberId,
            likeRefId: likeRefId,
            likeGroup: like_enum_1.LikeGroup.PROPERTY,
        };
        const modifier = await this.likeService.toggleLike(input);
        const result = await this.propertyStatsEditor({ _id: likeRefId, targetKey: 'propertyLikes', modifier: modifier });
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.SOMETHING_WENT_WRONG);
        return result;
    }
    async getAllPropertiesByAdmin(input) {
        const { propertyStatus, propertyLocationList } = input.search;
        const match = {};
        const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? common_enum_1.Direction.DESC };
        if (propertyStatus)
            match.propertyStatus = propertyStatus;
        if (propertyLocationList)
            match.propertyLocation = { $in: propertyLocationList };
        const result = await this.propertyModel
            .aggregate([
            { $match: match },
            { $sort: sort },
            {
                $facet: {
                    list: [
                        { $skip: (input.page - 1) * input.limit },
                        { $limit: input.limit },
                        config_1.lookupMember,
                        { $unwind: '$memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        if (!result.length)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.NO_DATA_FOUND);
        return result[0];
    }
    async updatePropertyByAdmin(input) {
        let { propertyStatus, soldAt, deletedAt } = input;
        const search = {
            _id: input._id,
            propertyStatus: property_enum_1.PropertyStatus.ACTIVE,
        };
        if (propertyStatus === property_enum_1.PropertyStatus.SOLD)
            soldAt = (0, moment_1.default)().toDate();
        else if (propertyStatus === property_enum_1.PropertyStatus.DELETE)
            deletedAt = (0, moment_1.default)().toDate();
        const result = await this.propertyModel
            .findOneAndUpdate(search, input, {
            new: true,
        })
            .exec();
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.UPDATE_FAILED);
        if (soldAt || deletedAt) {
            await this.memberService.memberStatsEditor({
                _id: result.memberId,
                targetKey: 'memberProperties',
                modifier: -1,
            });
        }
        return result;
    }
    async removePropertyByAdmin(propertyId) {
        const search = { _id: propertyId, propertyStatus: property_enum_1.PropertyStatus.DELETE };
        const result = await this.propertyModel.findOneAndDelete(search).exec();
        if (!result)
            throw new common_1.InternalServerErrorException(common_enum_1.Message.REMOVE_FAILED);
        return result;
    }
    async propertyStatsEditor(input) {
        const { _id, targetKey, modifier } = input;
        return await this.propertyModel
            .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, {
            new: true,
        })
            .exec();
    }
};
exports.PropertyService = PropertyService;
exports.PropertyService = PropertyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Property')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof member_service_1.MemberService !== "undefined" && member_service_1.MemberService) === "function" ? _b : Object, typeof (_c = typeof view_service_1.ViewService !== "undefined" && view_service_1.ViewService) === "function" ? _c : Object, typeof (_d = typeof like_service_1.LikeService !== "undefined" && like_service_1.LikeService) === "function" ? _d : Object])
], PropertyService);


/***/ }),

/***/ "./apps/nestar-api/src/components/view/view.module.ts":
/*!************************************************************!*\
  !*** ./apps/nestar-api/src/components/view/view.module.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ViewModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const view_service_1 = __webpack_require__(/*! ./view.service */ "./apps/nestar-api/src/components/view/view.service.ts");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const View_model_1 = __importDefault(__webpack_require__(/*! ../../schemas/View.model */ "./apps/nestar-api/src/schemas/View.model.ts"));
let ViewModule = class ViewModule {
};
exports.ViewModule = ViewModule;
exports.ViewModule = ViewModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: 'View', schema: View_model_1.default }])],
        providers: [view_service_1.ViewService],
        exports: [view_service_1.ViewService],
    })
], ViewModule);


/***/ }),

/***/ "./apps/nestar-api/src/components/view/view.service.ts":
/*!*************************************************************!*\
  !*** ./apps/nestar-api/src/components/view/view.service.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ViewService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
const view_enum_1 = __webpack_require__(/*! ../../libs/enums/view.enum */ "./apps/nestar-api/src/libs/enums/view.enum.ts");
const config_1 = __webpack_require__(/*! ../../libs/config */ "./apps/nestar-api/src/libs/config.ts");
let ViewService = class ViewService {
    viewModel;
    constructor(viewModel) {
        this.viewModel = viewModel;
    }
    async recordView(input) {
        const viewExist = await this.checkViewExistence(input);
        if (!viewExist) {
            console.log("- New View Insert -");
            return await this.viewModel.create(input);
        }
        else
            return null;
    }
    async checkViewExistence(input) {
        const { memberId, viewRefId } = input;
        const search = { memberId: memberId, viewRefId: viewRefId };
        return await this.viewModel.findOne(search).exec();
    }
    async getVisitedProperties(memberId, input) {
        const { page, limit } = input;
        const match = { viewGroup: view_enum_1.ViewGroup.PROPERTY, memberId: memberId };
        const data = await this.viewModel
            .aggregate([
            { $match: match },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: 'properties',
                    localField: 'viewRefId',
                    foreignField: '_id',
                    as: 'visitedProperty',
                },
            },
            { $unwind: '$visitedProperty' },
            {
                $facet: {
                    list: [
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                        config_1.lookupVisit,
                        { $unwind: '$visitedProperty.memberData' },
                    ],
                    metaCounter: [{ $count: 'total' }],
                },
            },
        ])
            .exec();
        const result = { list: [], metaCounter: data[0].metaCounter };
        result.list = data[0].list.map((ele) => ele.visitedProperty);
        console.log('result:', result);
        return result;
    }
};
exports.ViewService = ViewService;
exports.ViewService = ViewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('View')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], ViewService);


/***/ }),

/***/ "./apps/nestar-api/src/database/database.module.ts":
/*!*********************************************************!*\
  !*** ./apps/nestar-api/src/database/database.module.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let DatabaseModule = class DatabaseModule {
    connection;
    constructor(connection) {
        this.connection = connection;
        if (connection.readyState === 1) {
            console.log(`MongoDB is connected into ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} db`);
        }
        else {
            console.log('DB is connected!');
        }
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRootAsync({
                useFactory: () => ({
                    uri: process.env.NODE_ENV === "production" ? process.env.MONGO_PROD : process.env.MONGO_DEV,
                }),
            }),
        ],
        exports: [mongoose_1.MongooseModule],
    }),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Connection !== "undefined" && mongoose_2.Connection) === "function" ? _a : Object])
], DatabaseModule);


/***/ }),

/***/ "./apps/nestar-api/src/libs/config.ts":
/*!********************************************!*\
  !*** ./apps/nestar-api/src/libs/config.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.lookupVisit = exports.lookupFavorite = exports.lookupFollowerData = exports.lookupFollowingData = exports.lookupMember = exports.lookupAuthMemberFollowed = exports.lookupAuthMemberLiked = exports.shapeIntoMongoObjectId = exports.getSerialForImage = exports.validMimeTypes = exports.availableCommentSorts = exports.availableBoardArticleSorts = exports.availablePropertySorts = exports.availableOptions = exports.availableMemberSorts = exports.availableAgentSorts = void 0;
exports.availableAgentSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
exports.availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];
exports.availableOptions = ['propertyBarter', 'propertyRent'];
exports.availablePropertySorts = [
    'createdAt',
    'updatedAt',
    'propertyLikes',
    'propertyViews',
    'propertyRank',
    'propertyPrice',
];
exports.availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];
exports.availableCommentSorts = ['createdAt', 'updatedAt'];
const uuid_1 = __webpack_require__(/*! uuid */ "uuid");
const path = __importStar(__webpack_require__(/*! path */ "path"));
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
exports.validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
const getSerialForImage = (filename) => {
    const ext = path.parse(filename).ext;
    return (0, uuid_1.v4)() + ext;
};
exports.getSerialForImage = getSerialForImage;
const shapeIntoMongoObjectId = (target) => {
    return typeof target === 'string' ? new mongoose_1.Types.ObjectId(target) : target;
};
exports.shapeIntoMongoObjectId = shapeIntoMongoObjectId;
const lookupAuthMemberLiked = (memberId, targetRefId = '$_id') => {
    return {
        $lookup: {
            from: 'likes',
            let: {
                localLikeRefId: targetRefId,
                localMemberId: memberId,
                localMyFavorite: true,
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        memberId: 1,
                        likeRefId: 1,
                        myFavorite: '$$localMyFavorite',
                    },
                },
            ],
            as: 'meLiked',
        },
    };
};
exports.lookupAuthMemberLiked = lookupAuthMemberLiked;
const lookupAuthMemberFollowed = (input) => {
    const { followerId, followingId } = input;
    return {
        $lookup: {
            from: 'follows',
            let: {
                localFollowerId: followerId,
                localFollowingId: followingId,
                localMyFavorite: true,
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [{ $eq: ['$followerId', '$$localFollowerId'] }, { $eq: ['$followingId', '$$localFollowingId'] }],
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        followerId: 1,
                        followingId: 1,
                        myFollowing: '$$localMyFavorite',
                    },
                },
            ],
            as: 'meFollowed',
        },
    };
};
exports.lookupAuthMemberFollowed = lookupAuthMemberFollowed;
exports.lookupMember = {
    $lookup: {
        from: 'members',
        localField: 'memberId',
        foreignField: '_id',
        as: 'memberData',
    },
};
exports.lookupFollowingData = {
    $lookup: {
        from: 'members',
        localField: 'followingId',
        foreignField: '_id',
        as: 'followingData',
    },
};
exports.lookupFollowerData = {
    $lookup: {
        from: 'members',
        localField: 'followerId',
        foreignField: '_id',
        as: 'followerData',
    },
};
exports.lookupFavorite = {
    $lookup: {
        from: 'members',
        localField: 'favoriteProperty.memberId',
        foreignField: '_id',
        as: 'favoriteProperty.memberData',
    },
};
exports.lookupVisit = {
    $lookup: {
        from: 'members',
        localField: 'visitedProperty.memberId',
        foreignField: '_id',
        as: 'visitedProperty.memberData',
    },
};


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/board-article/board-article.input.ts":
/*!***************************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/board-article/board-article.input.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AllBoardArticlesInquiry = exports.BoardArticlesInquiry = exports.BoardArticleInput = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const board_article_enum_1 = __webpack_require__(/*! ../../enums/board-article.enum */ "./apps/nestar-api/src/libs/enums/board-article.enum.ts");
const common_enum_1 = __webpack_require__(/*! ../../enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
const config_1 = __webpack_require__(/*! ../../config */ "./apps/nestar-api/src/libs/config.ts");
let BoardArticleInput = class BoardArticleInput {
    articleCategory;
    articleTitle;
    articleContent;
    articleImage;
    memberId;
};
exports.BoardArticleInput = BoardArticleInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => board_article_enum_1.BoardArticleCategory),
    __metadata("design:type", typeof (_a = typeof board_article_enum_1.BoardArticleCategory !== "undefined" && board_article_enum_1.BoardArticleCategory) === "function" ? _a : Object)
], BoardArticleInput.prototype, "articleCategory", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 50),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], BoardArticleInput.prototype, "articleTitle", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 250),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], BoardArticleInput.prototype, "articleContent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BoardArticleInput.prototype, "articleImage", void 0);
exports.BoardArticleInput = BoardArticleInput = __decorate([
    (0, graphql_1.InputType)()
], BoardArticleInput);
let BAISearch = class BAISearch {
    articleCategory;
    text;
    memberId;
};
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => board_article_enum_1.BoardArticleCategory, { nullable: true }),
    __metadata("design:type", typeof (_b = typeof board_article_enum_1.BoardArticleCategory !== "undefined" && board_article_enum_1.BoardArticleCategory) === "function" ? _b : Object)
], BAISearch.prototype, "articleCategory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BAISearch.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], BAISearch.prototype, "memberId", void 0);
BAISearch = __decorate([
    (0, graphql_1.InputType)()
], BAISearch);
let BoardArticlesInquiry = class BoardArticlesInquiry {
    page;
    limit;
    sort;
    direction;
    search;
};
exports.BoardArticlesInquiry = BoardArticlesInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BoardArticlesInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BoardArticlesInquiry.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(config_1.availableBoardArticleSorts),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BoardArticlesInquiry.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => common_enum_1.Direction, { nullable: true }),
    __metadata("design:type", typeof (_c = typeof common_enum_1.Direction !== "undefined" && common_enum_1.Direction) === "function" ? _c : Object)
], BoardArticlesInquiry.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => BAISearch),
    __metadata("design:type", BAISearch)
], BoardArticlesInquiry.prototype, "search", void 0);
exports.BoardArticlesInquiry = BoardArticlesInquiry = __decorate([
    (0, graphql_1.InputType)()
], BoardArticlesInquiry);
let ABAISearch = class ABAISearch {
    articleStatus;
    articleCategory;
};
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => board_article_enum_1.BoardArticleStatus, { nullable: true }),
    __metadata("design:type", typeof (_d = typeof board_article_enum_1.BoardArticleStatus !== "undefined" && board_article_enum_1.BoardArticleStatus) === "function" ? _d : Object)
], ABAISearch.prototype, "articleStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => board_article_enum_1.BoardArticleCategory, { nullable: true }),
    __metadata("design:type", typeof (_e = typeof board_article_enum_1.BoardArticleCategory !== "undefined" && board_article_enum_1.BoardArticleCategory) === "function" ? _e : Object)
], ABAISearch.prototype, "articleCategory", void 0);
ABAISearch = __decorate([
    (0, graphql_1.InputType)()
], ABAISearch);
let AllBoardArticlesInquiry = class AllBoardArticlesInquiry {
    page;
    limit;
    sort;
    direction;
    search;
};
exports.AllBoardArticlesInquiry = AllBoardArticlesInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AllBoardArticlesInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AllBoardArticlesInquiry.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(config_1.availableBoardArticleSorts),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AllBoardArticlesInquiry.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => common_enum_1.Direction, { nullable: true }),
    __metadata("design:type", typeof (_f = typeof common_enum_1.Direction !== "undefined" && common_enum_1.Direction) === "function" ? _f : Object)
], AllBoardArticlesInquiry.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => ABAISearch),
    __metadata("design:type", ABAISearch)
], AllBoardArticlesInquiry.prototype, "search", void 0);
exports.AllBoardArticlesInquiry = AllBoardArticlesInquiry = __decorate([
    (0, graphql_1.InputType)()
], AllBoardArticlesInquiry);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/board-article/board-article.ts":
/*!*********************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/board-article/board-article.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BoardArticles = exports.BoardArticle = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const board_article_enum_1 = __webpack_require__(/*! ../../enums/board-article.enum */ "./apps/nestar-api/src/libs/enums/board-article.enum.ts");
const member_1 = __webpack_require__(/*! ../member/member */ "./apps/nestar-api/src/libs/dto/member/member.ts");
const like_1 = __webpack_require__(/*! ../like/like */ "./apps/nestar-api/src/libs/dto/like/like.ts");
let BoardArticle = class BoardArticle {
    _id;
    articleCategory;
    articleStatus;
    articleTitle;
    articleContent;
    articleImage;
    articleViews;
    articleLikes;
    articleComments;
    memberId;
    createdAt;
    updatedAt;
    meLiked;
    memberData;
};
exports.BoardArticle = BoardArticle;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], BoardArticle.prototype, "_id", void 0);
__decorate([
    (0, graphql_1.Field)(() => board_article_enum_1.BoardArticleCategory),
    __metadata("design:type", typeof (_a = typeof board_article_enum_1.BoardArticleCategory !== "undefined" && board_article_enum_1.BoardArticleCategory) === "function" ? _a : Object)
], BoardArticle.prototype, "articleCategory", void 0);
__decorate([
    (0, graphql_1.Field)(() => board_article_enum_1.BoardArticleStatus),
    __metadata("design:type", typeof (_b = typeof board_article_enum_1.BoardArticleStatus !== "undefined" && board_article_enum_1.BoardArticleStatus) === "function" ? _b : Object)
], BoardArticle.prototype, "articleStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], BoardArticle.prototype, "articleTitle", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], BoardArticle.prototype, "articleContent", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BoardArticle.prototype, "articleImage", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BoardArticle.prototype, "articleViews", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BoardArticle.prototype, "articleLikes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BoardArticle.prototype, "articleComments", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], BoardArticle.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], BoardArticle.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], BoardArticle.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [like_1.MeLiked], { nullable: true }),
    __metadata("design:type", Array)
], BoardArticle.prototype, "meLiked", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_1.Member, { nullable: true }),
    __metadata("design:type", typeof (_e = typeof member_1.Member !== "undefined" && member_1.Member) === "function" ? _e : Object)
], BoardArticle.prototype, "memberData", void 0);
exports.BoardArticle = BoardArticle = __decorate([
    (0, graphql_1.ObjectType)()
], BoardArticle);
let BoardArticles = class BoardArticles {
    list;
    metaCounter;
};
exports.BoardArticles = BoardArticles;
__decorate([
    (0, graphql_1.Field)(() => [BoardArticle]),
    __metadata("design:type", Array)
], BoardArticles.prototype, "list", void 0);
__decorate([
    (0, graphql_1.Field)(() => [member_1.TotalCounter], { nullable: true }),
    __metadata("design:type", Array)
], BoardArticles.prototype, "metaCounter", void 0);
exports.BoardArticles = BoardArticles = __decorate([
    (0, graphql_1.ObjectType)()
], BoardArticles);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/board-article/board-article.update.ts":
/*!****************************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/board-article/board-article.update.ts ***!
  \****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BoardArticleUpdate = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const board_article_enum_1 = __webpack_require__(/*! ../../enums/board-article.enum */ "./apps/nestar-api/src/libs/enums/board-article.enum.ts");
let BoardArticleUpdate = class BoardArticleUpdate {
    _id;
    articleStatus;
    articleTitle;
    articleContent;
    articleImage;
};
exports.BoardArticleUpdate = BoardArticleUpdate;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], BoardArticleUpdate.prototype, "_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => board_article_enum_1.BoardArticleStatus, { nullable: true }),
    __metadata("design:type", typeof (_a = typeof board_article_enum_1.BoardArticleStatus !== "undefined" && board_article_enum_1.BoardArticleStatus) === "function" ? _a : Object)
], BoardArticleUpdate.prototype, "articleStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(3, 50),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BoardArticleUpdate.prototype, "articleTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(3, 250),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BoardArticleUpdate.prototype, "articleContent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], BoardArticleUpdate.prototype, "articleImage", void 0);
exports.BoardArticleUpdate = BoardArticleUpdate = __decorate([
    (0, graphql_1.InputType)()
], BoardArticleUpdate);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/comment/comment.input.ts":
/*!***************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/comment/comment.input.ts ***!
  \***************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentsInquiry = exports.CommentInput = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const comment_enum_1 = __webpack_require__(/*! ../../enums/comment.enum */ "./apps/nestar-api/src/libs/enums/comment.enum.ts");
const common_enum_1 = __webpack_require__(/*! ../../enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
const config_1 = __webpack_require__(/*! ../../config */ "./apps/nestar-api/src/libs/config.ts");
let CommentInput = class CommentInput {
    commentGroup;
    commentContent;
    commentRefId;
    memberId;
};
exports.CommentInput = CommentInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => comment_enum_1.CommentGroup),
    __metadata("design:type", typeof (_a = typeof comment_enum_1.CommentGroup !== "undefined" && comment_enum_1.CommentGroup) === "function" ? _a : Object)
], CommentInput.prototype, "commentGroup", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 100),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CommentInput.prototype, "commentContent", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], CommentInput.prototype, "commentRefId", void 0);
exports.CommentInput = CommentInput = __decorate([
    (0, graphql_1.InputType)()
], CommentInput);
let CISearch = class CISearch {
    commentRefId;
};
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], CISearch.prototype, "commentRefId", void 0);
CISearch = __decorate([
    (0, graphql_1.InputType)()
], CISearch);
let CommentsInquiry = class CommentsInquiry {
    page;
    limit;
    sort;
    direction;
    search;
};
exports.CommentsInquiry = CommentsInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommentsInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommentsInquiry.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(config_1.availableCommentSorts),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CommentsInquiry.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => common_enum_1.Direction, { nullable: true }),
    __metadata("design:type", typeof (_b = typeof common_enum_1.Direction !== "undefined" && common_enum_1.Direction) === "function" ? _b : Object)
], CommentsInquiry.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => CISearch),
    __metadata("design:type", CISearch)
], CommentsInquiry.prototype, "search", void 0);
exports.CommentsInquiry = CommentsInquiry = __decorate([
    (0, graphql_1.InputType)()
], CommentsInquiry);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/comment/comment.ts":
/*!*********************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/comment/comment.ts ***!
  \*********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Comments = exports.Comment = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const comment_enum_1 = __webpack_require__(/*! ../../enums/comment.enum */ "./apps/nestar-api/src/libs/enums/comment.enum.ts");
const member_1 = __webpack_require__(/*! ../member/member */ "./apps/nestar-api/src/libs/dto/member/member.ts");
let Comment = class Comment {
    _id;
    commentStatus;
    commentGroup;
    commentContent;
    commentRefId;
    memberId;
    createdAt;
    updatedAt;
    memberData;
};
exports.Comment = Comment;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Comment.prototype, "_id", void 0);
__decorate([
    (0, graphql_1.Field)(() => comment_enum_1.CommentStatus),
    __metadata("design:type", typeof (_a = typeof comment_enum_1.CommentStatus !== "undefined" && comment_enum_1.CommentStatus) === "function" ? _a : Object)
], Comment.prototype, "commentStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => comment_enum_1.CommentGroup),
    __metadata("design:type", typeof (_b = typeof comment_enum_1.CommentGroup !== "undefined" && comment_enum_1.CommentGroup) === "function" ? _b : Object)
], Comment.prototype, "commentGroup", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Comment.prototype, "commentContent", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Comment.prototype, "commentRefId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Comment.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Comment.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Comment.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_1.Member, { nullable: true }),
    __metadata("design:type", typeof (_e = typeof member_1.Member !== "undefined" && member_1.Member) === "function" ? _e : Object)
], Comment.prototype, "memberData", void 0);
exports.Comment = Comment = __decorate([
    (0, graphql_1.ObjectType)()
], Comment);
let Comments = class Comments {
    list;
    metaCounter;
};
exports.Comments = Comments;
__decorate([
    (0, graphql_1.Field)(() => [Comment]),
    __metadata("design:type", Array)
], Comments.prototype, "list", void 0);
__decorate([
    (0, graphql_1.Field)(() => [member_1.TotalCounter], { nullable: true }),
    __metadata("design:type", Array)
], Comments.prototype, "metaCounter", void 0);
exports.Comments = Comments = __decorate([
    (0, graphql_1.ObjectType)()
], Comments);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/comment/comment.update.ts":
/*!****************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/comment/comment.update.ts ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentUpdate = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const comment_enum_1 = __webpack_require__(/*! ../../enums/comment.enum */ "./apps/nestar-api/src/libs/enums/comment.enum.ts");
let CommentUpdate = class CommentUpdate {
    _id;
    commentStatus;
    commentContent;
};
exports.CommentUpdate = CommentUpdate;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], CommentUpdate.prototype, "_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => comment_enum_1.CommentStatus, { nullable: true }),
    __metadata("design:type", typeof (_a = typeof comment_enum_1.CommentStatus !== "undefined" && comment_enum_1.CommentStatus) === "function" ? _a : Object)
], CommentUpdate.prototype, "commentStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(1, 100),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], CommentUpdate.prototype, "commentContent", void 0);
exports.CommentUpdate = CommentUpdate = __decorate([
    (0, graphql_1.InputType)()
], CommentUpdate);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/follow/follow.input.ts":
/*!*************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/follow/follow.input.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FollowInquiry = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
let FollowSearch = class FollowSearch {
    followingId;
    followerId;
};
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FollowSearch.prototype, "followingId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FollowSearch.prototype, "followerId", void 0);
FollowSearch = __decorate([
    (0, graphql_1.InputType)()
], FollowSearch);
let FollowInquiry = class FollowInquiry {
    page;
    limit;
    search;
};
exports.FollowInquiry = FollowInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FollowInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], FollowInquiry.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => FollowSearch),
    __metadata("design:type", FollowSearch)
], FollowInquiry.prototype, "search", void 0);
exports.FollowInquiry = FollowInquiry = __decorate([
    (0, graphql_1.InputType)()
], FollowInquiry);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/follow/follow.ts":
/*!*******************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/follow/follow.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Followers = exports.Followings = exports.Following = exports.Follower = exports.MeFollowed = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const member_1 = __webpack_require__(/*! ../member/member */ "./apps/nestar-api/src/libs/dto/member/member.ts");
const like_1 = __webpack_require__(/*! ../like/like */ "./apps/nestar-api/src/libs/dto/like/like.ts");
let MeFollowed = class MeFollowed {
    followingId;
    followerId;
    myFollowing;
};
exports.MeFollowed = MeFollowed;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], MeFollowed.prototype, "followingId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], MeFollowed.prototype, "followerId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], MeFollowed.prototype, "myFollowing", void 0);
exports.MeFollowed = MeFollowed = __decorate([
    (0, graphql_1.ObjectType)()
], MeFollowed);
let Follower = class Follower {
    _id;
    followingId;
    followerId;
    createdAt;
    updatedAt;
    meLiked;
    meFollowed;
    followerData;
};
exports.Follower = Follower;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Follower.prototype, "_id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Follower.prototype, "followingId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Follower.prototype, "followerId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Follower.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Follower.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [like_1.MeLiked], { nullable: true }),
    __metadata("design:type", Array)
], Follower.prototype, "meLiked", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MeFollowed], { nullable: true }),
    __metadata("design:type", Array)
], Follower.prototype, "meFollowed", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_1.Member, { nullable: true }),
    __metadata("design:type", typeof (_c = typeof member_1.Member !== "undefined" && member_1.Member) === "function" ? _c : Object)
], Follower.prototype, "followerData", void 0);
exports.Follower = Follower = __decorate([
    (0, graphql_1.ObjectType)()
], Follower);
let Following = class Following {
    _id;
    followingId;
    followerId;
    createdAt;
    updatedAt;
    meLiked;
    meFollowed;
    followingData;
};
exports.Following = Following;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Following.prototype, "_id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Following.prototype, "followingId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Following.prototype, "followerId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Following.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], Following.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [like_1.MeLiked], { nullable: true }),
    __metadata("design:type", Array)
], Following.prototype, "meLiked", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MeFollowed], { nullable: true }),
    __metadata("design:type", Array)
], Following.prototype, "meFollowed", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_1.Member, { nullable: true }),
    __metadata("design:type", typeof (_f = typeof member_1.Member !== "undefined" && member_1.Member) === "function" ? _f : Object)
], Following.prototype, "followingData", void 0);
exports.Following = Following = __decorate([
    (0, graphql_1.ObjectType)()
], Following);
let Followings = class Followings {
    list;
    metaCounter;
};
exports.Followings = Followings;
__decorate([
    (0, graphql_1.Field)(() => [Following]),
    __metadata("design:type", Array)
], Followings.prototype, "list", void 0);
__decorate([
    (0, graphql_1.Field)(() => [member_1.TotalCounter], { nullable: true }),
    __metadata("design:type", Array)
], Followings.prototype, "metaCounter", void 0);
exports.Followings = Followings = __decorate([
    (0, graphql_1.ObjectType)()
], Followings);
let Followers = class Followers {
    list;
    metaCounter;
};
exports.Followers = Followers;
__decorate([
    (0, graphql_1.Field)(() => [Follower]),
    __metadata("design:type", Array)
], Followers.prototype, "list", void 0);
__decorate([
    (0, graphql_1.Field)(() => [member_1.TotalCounter], { nullable: true }),
    __metadata("design:type", Array)
], Followers.prototype, "metaCounter", void 0);
exports.Followers = Followers = __decorate([
    (0, graphql_1.ObjectType)()
], Followers);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/like/like.ts":
/*!***************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/like/like.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Like = exports.MeLiked = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const like_enum_1 = __webpack_require__(/*! ../../enums/like.enum */ "./apps/nestar-api/src/libs/enums/like.enum.ts");
let MeLiked = class MeLiked {
    memberId;
    likeRefId;
    myFavorite;
};
exports.MeLiked = MeLiked;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], MeLiked.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], MeLiked.prototype, "likeRefId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], MeLiked.prototype, "myFavorite", void 0);
exports.MeLiked = MeLiked = __decorate([
    (0, graphql_1.ObjectType)()
], MeLiked);
let Like = class Like {
    _id;
    likeGroup;
    likeRefId;
    memberId;
    createdAt;
    updatedAt;
};
exports.Like = Like;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Like.prototype, "_id", void 0);
__decorate([
    (0, graphql_1.Field)(() => like_enum_1.LikeGroup),
    __metadata("design:type", typeof (_a = typeof like_enum_1.LikeGroup !== "undefined" && like_enum_1.LikeGroup) === "function" ? _a : Object)
], Like.prototype, "likeGroup", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Like.prototype, "likeRefId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Like.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Like.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Like.prototype, "updatedAt", void 0);
exports.Like = Like = __decorate([
    (0, graphql_1.ObjectType)()
], Like);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/member/member.input.ts":
/*!*************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/member/member.input.ts ***!
  \*************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MembersInquiry = exports.AgentsInquiry = exports.LoginInput = exports.MemberInput = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const member_enum_1 = __webpack_require__(/*! ../../enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const config_1 = __webpack_require__(/*! ../../config */ "./apps/nestar-api/src/libs/config.ts");
const common_enum_1 = __webpack_require__(/*! ../../enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
let MemberInput = class MemberInput {
    memberNick;
    memberPassword;
    memberPhone;
    memberType;
    memberAuthType;
};
exports.MemberInput = MemberInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 12),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MemberInput.prototype, "memberNick", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(5, 12),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MemberInput.prototype, "memberPassword", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MemberInput.prototype, "memberPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => member_enum_1.MemberType, { nullable: true }),
    __metadata("design:type", typeof (_a = typeof member_enum_1.MemberType !== "undefined" && member_enum_1.MemberType) === "function" ? _a : Object)
], MemberInput.prototype, "memberType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => member_enum_1.MemberAuthType, { nullable: true }),
    __metadata("design:type", typeof (_b = typeof member_enum_1.MemberAuthType !== "undefined" && member_enum_1.MemberAuthType) === "function" ? _b : Object)
], MemberInput.prototype, "memberAuthType", void 0);
exports.MemberInput = MemberInput = __decorate([
    (0, graphql_1.InputType)()
], MemberInput);
let LoginInput = class LoginInput {
    memberNick;
    memberPassword;
};
exports.LoginInput = LoginInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 12),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], LoginInput.prototype, "memberNick", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(5, 12),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], LoginInput.prototype, "memberPassword", void 0);
exports.LoginInput = LoginInput = __decorate([
    (0, graphql_1.InputType)()
], LoginInput);
let AISearch = class AISearch {
    text;
};
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AISearch.prototype, "text", void 0);
AISearch = __decorate([
    (0, graphql_1.InputType)()
], AISearch);
let AgentsInquiry = class AgentsInquiry {
    page;
    limit;
    sort;
    direction;
    search;
};
exports.AgentsInquiry = AgentsInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AgentsInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AgentsInquiry.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(config_1.availableAgentSorts),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AgentsInquiry.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => common_enum_1.Direction, { nullable: true }),
    __metadata("design:type", typeof (_c = typeof common_enum_1.Direction !== "undefined" && common_enum_1.Direction) === "function" ? _c : Object)
], AgentsInquiry.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => AISearch),
    __metadata("design:type", AISearch)
], AgentsInquiry.prototype, "search", void 0);
exports.AgentsInquiry = AgentsInquiry = __decorate([
    (0, graphql_1.InputType)()
], AgentsInquiry);
let MISearch = class MISearch {
    memberStatus;
    memberType;
    text;
};
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => member_enum_1.MemberStatus, { nullable: true }),
    __metadata("design:type", typeof (_d = typeof member_enum_1.MemberStatus !== "undefined" && member_enum_1.MemberStatus) === "function" ? _d : Object)
], MISearch.prototype, "memberStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => member_enum_1.MemberType, { nullable: true }),
    __metadata("design:type", typeof (_e = typeof member_enum_1.MemberType !== "undefined" && member_enum_1.MemberType) === "function" ? _e : Object)
], MISearch.prototype, "memberType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MISearch.prototype, "text", void 0);
MISearch = __decorate([
    (0, graphql_1.InputType)()
], MISearch);
let MembersInquiry = class MembersInquiry {
    page;
    limit;
    sort;
    direction;
    search;
};
exports.MembersInquiry = MembersInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MembersInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MembersInquiry.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(config_1.availableMemberSorts),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MembersInquiry.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => common_enum_1.Direction, { nullable: true }),
    __metadata("design:type", typeof (_f = typeof common_enum_1.Direction !== "undefined" && common_enum_1.Direction) === "function" ? _f : Object)
], MembersInquiry.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => MISearch),
    __metadata("design:type", MISearch)
], MembersInquiry.prototype, "search", void 0);
exports.MembersInquiry = MembersInquiry = __decorate([
    (0, graphql_1.InputType)()
], MembersInquiry);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/member/member.ts":
/*!*******************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/member/member.ts ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Members = exports.TotalCounter = exports.Member = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const mongoose = __importStar(__webpack_require__(/*! mongoose */ "mongoose"));
const member_enum_1 = __webpack_require__(/*! ../../enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const like_1 = __webpack_require__(/*! ../like/like */ "./apps/nestar-api/src/libs/dto/like/like.ts");
const follow_1 = __webpack_require__(/*! ../follow/follow */ "./apps/nestar-api/src/libs/dto/follow/follow.ts");
let Member = class Member {
    _id;
    memberType;
    memberStatus;
    memberAuthType;
    memberPhone;
    memberNick;
    memberPassword;
    memberFullName;
    memberImage;
    memberAddress;
    memberDesc;
    memberProperties;
    memberArticles;
    memberFollowers;
    memberFollowings;
    memberPoints;
    memberLikes;
    memberViews;
    memberComments;
    memberRank;
    memberWarnings;
    memberBlocks;
    deletedAt;
    createdAt;
    updatedAt;
    accessToken;
    toObject;
    meLiked;
    meFollowed;
};
exports.Member = Member;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", typeof (_a = typeof mongoose !== "undefined" && mongoose.ObjectId) === "function" ? _a : Object)
], Member.prototype, "_id", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_enum_1.MemberType),
    __metadata("design:type", typeof (_b = typeof member_enum_1.MemberType !== "undefined" && member_enum_1.MemberType) === "function" ? _b : Object)
], Member.prototype, "memberType", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_enum_1.MemberStatus),
    __metadata("design:type", typeof (_c = typeof member_enum_1.MemberStatus !== "undefined" && member_enum_1.MemberStatus) === "function" ? _c : Object)
], Member.prototype, "memberStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_enum_1.MemberAuthType),
    __metadata("design:type", typeof (_d = typeof member_enum_1.MemberAuthType !== "undefined" && member_enum_1.MemberAuthType) === "function" ? _d : Object)
], Member.prototype, "memberAuthType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Member.prototype, "memberPhone", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Member.prototype, "memberNick", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "memberFullName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Member.prototype, "memberImage", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "memberAddress", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "memberDesc", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberProperties", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberArticles", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberFollowers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberFollowings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberPoints", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberLikes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberViews", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberComments", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberRank", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberWarnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Member.prototype, "memberBlocks", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], Member.prototype, "deletedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], Member.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_g = typeof Date !== "undefined" && Date) === "function" ? _g : Object)
], Member.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "accessToken", void 0);
__decorate([
    (0, graphql_1.Field)(() => [like_1.MeLiked], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "meLiked", void 0);
__decorate([
    (0, graphql_1.Field)(() => [follow_1.MeFollowed], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "meFollowed", void 0);
exports.Member = Member = __decorate([
    (0, graphql_1.ObjectType)()
], Member);
let TotalCounter = class TotalCounter {
    total;
};
exports.TotalCounter = TotalCounter;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], TotalCounter.prototype, "total", void 0);
exports.TotalCounter = TotalCounter = __decorate([
    (0, graphql_1.ObjectType)()
], TotalCounter);
let Members = class Members {
    list;
    metaCounter;
};
exports.Members = Members;
__decorate([
    (0, graphql_1.Field)(() => [Member]),
    __metadata("design:type", Array)
], Members.prototype, "list", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TotalCounter], { nullable: true }),
    __metadata("design:type", Array)
], Members.prototype, "metaCounter", void 0);
exports.Members = Members = __decorate([
    (0, graphql_1.ObjectType)()
], Members);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/member/member.update.ts":
/*!**************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/member/member.update.ts ***!
  \**************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MemberUpdate = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const member_enum_1 = __webpack_require__(/*! ../../enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const mongoose = __importStar(__webpack_require__(/*! mongoose */ "mongoose"));
let MemberUpdate = class MemberUpdate {
    _id;
    memberType;
    memberStatus;
    memberPhone;
    memberNick;
    memberPassword;
    memberFullName;
    memberImage;
    memberAddress;
    memberDesc;
    deleteAt;
};
exports.MemberUpdate = MemberUpdate;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", typeof (_a = typeof mongoose !== "undefined" && mongoose.ObjectId) === "function" ? _a : Object)
], MemberUpdate.prototype, "_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => member_enum_1.MemberType, { nullable: true }),
    __metadata("design:type", typeof (_b = typeof member_enum_1.MemberType !== "undefined" && member_enum_1.MemberType) === "function" ? _b : Object)
], MemberUpdate.prototype, "memberType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => member_enum_1.MemberStatus, { nullable: true }),
    __metadata("design:type", typeof (_c = typeof member_enum_1.MemberStatus !== "undefined" && member_enum_1.MemberStatus) === "function" ? _c : Object)
], MemberUpdate.prototype, "memberStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MemberUpdate.prototype, "memberPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(3, 12),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MemberUpdate.prototype, "memberNick", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(5, 12),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MemberUpdate.prototype, "memberPassword", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 100),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MemberUpdate.prototype, "memberFullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MemberUpdate.prototype, "memberImage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MemberUpdate.prototype, "memberAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MemberUpdate.prototype, "memberDesc", void 0);
exports.MemberUpdate = MemberUpdate = __decorate([
    (0, graphql_1.InputType)()
], MemberUpdate);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/property/property.input.ts":
/*!*****************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/property/property.input.ts ***!
  \*****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrdinaryInquiry = exports.AllPropertiesInquiry = exports.AgentPropertiesInquiry = exports.PropertiesInquiry = exports.PeriodsRange = exports.SquaresRange = exports.PricesRange = exports.PropertyInput = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const property_enum_1 = __webpack_require__(/*! ../../enums/property.enum */ "./apps/nestar-api/src/libs/enums/property.enum.ts");
const mongoose = __importStar(__webpack_require__(/*! mongoose */ "mongoose"));
const config_1 = __webpack_require__(/*! ../../config */ "./apps/nestar-api/src/libs/config.ts");
const common_enum_1 = __webpack_require__(/*! ../../enums/common.enum */ "./apps/nestar-api/src/libs/enums/common.enum.ts");
let PropertyInput = class PropertyInput {
    propertyType;
    propertyLocation;
    propertyAddress;
    propertyTitle;
    propertyPrice;
    propertySquare;
    propertyBeds;
    propertyRooms;
    propertyImages;
    propertyDesc;
    propertyBarter;
    propertyRent;
    memberId;
    constructedAt;
};
exports.PropertyInput = PropertyInput;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => property_enum_1.PropertyType),
    __metadata("design:type", typeof (_a = typeof property_enum_1.PropertyType !== "undefined" && property_enum_1.PropertyType) === "function" ? _a : Object)
], PropertyInput.prototype, "propertyType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => property_enum_1.PropertyLocation),
    __metadata("design:type", typeof (_b = typeof property_enum_1.PropertyLocation !== "undefined" && property_enum_1.PropertyLocation) === "function" ? _b : Object)
], PropertyInput.prototype, "propertyLocation", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 100),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], PropertyInput.prototype, "propertyAddress", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(3, 100),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], PropertyInput.prototype, "propertyTitle", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], PropertyInput.prototype, "propertyPrice", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], PropertyInput.prototype, "propertySquare", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PropertyInput.prototype, "propertyBeds", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PropertyInput.prototype, "propertyRooms", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], PropertyInput.prototype, "propertyImages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(5, 500),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PropertyInput.prototype, "propertyDesc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], PropertyInput.prototype, "propertyBarter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], PropertyInput.prototype, "propertyRent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], PropertyInput.prototype, "constructedAt", void 0);
exports.PropertyInput = PropertyInput = __decorate([
    (0, graphql_1.InputType)()
], PropertyInput);
let PricesRange = class PricesRange {
    start;
    end;
};
exports.PricesRange = PricesRange;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PricesRange.prototype, "start", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PricesRange.prototype, "end", void 0);
exports.PricesRange = PricesRange = __decorate([
    (0, graphql_1.InputType)()
], PricesRange);
let SquaresRange = class SquaresRange {
    start;
    end;
};
exports.SquaresRange = SquaresRange;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SquaresRange.prototype, "start", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SquaresRange.prototype, "end", void 0);
exports.SquaresRange = SquaresRange = __decorate([
    (0, graphql_1.InputType)()
], SquaresRange);
let PeriodsRange = class PeriodsRange {
    start;
    end;
};
exports.PeriodsRange = PeriodsRange;
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], PeriodsRange.prototype, "start", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], PeriodsRange.prototype, "end", void 0);
exports.PeriodsRange = PeriodsRange = __decorate([
    (0, graphql_1.InputType)()
], PeriodsRange);
let PISearch = class PISearch {
    memberId;
    locationList;
    typeList;
    roomsList;
    bedsList;
    options;
    pricesRange;
    periodsRange;
    squaresRange;
    text;
};
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", typeof (_f = typeof mongoose !== "undefined" && mongoose.ObjectId) === "function" ? _f : Object)
], PISearch.prototype, "memberId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => [property_enum_1.PropertyLocation], { nullable: true }),
    __metadata("design:type", Array)
], PISearch.prototype, "locationList", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => [property_enum_1.PropertyType], { nullable: true }),
    __metadata("design:type", Array)
], PISearch.prototype, "typeList", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => [graphql_1.Int], { nullable: true }),
    __metadata("design:type", Array)
], PISearch.prototype, "roomsList", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => [graphql_1.Int], { nullable: true }),
    __metadata("design:type", Array)
], PISearch.prototype, "bedsList", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(config_1.availableOptions, { each: true }),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], PISearch.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => PricesRange, { nullable: true }),
    __metadata("design:type", PricesRange)
], PISearch.prototype, "pricesRange", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => PeriodsRange, { nullable: true }),
    __metadata("design:type", PeriodsRange)
], PISearch.prototype, "periodsRange", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => SquaresRange, { nullable: true }),
    __metadata("design:type", SquaresRange)
], PISearch.prototype, "squaresRange", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PISearch.prototype, "text", void 0);
PISearch = __decorate([
    (0, graphql_1.InputType)()
], PISearch);
let PropertiesInquiry = class PropertiesInquiry {
    page;
    limit;
    sort;
    direction;
    search;
};
exports.PropertiesInquiry = PropertiesInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PropertiesInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PropertiesInquiry.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(config_1.availablePropertySorts),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PropertiesInquiry.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => common_enum_1.Direction, { nullable: true }),
    __metadata("design:type", typeof (_g = typeof common_enum_1.Direction !== "undefined" && common_enum_1.Direction) === "function" ? _g : Object)
], PropertiesInquiry.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => PISearch),
    __metadata("design:type", PISearch)
], PropertiesInquiry.prototype, "search", void 0);
exports.PropertiesInquiry = PropertiesInquiry = __decorate([
    (0, graphql_1.InputType)()
], PropertiesInquiry);
let APISearch = class APISearch {
    propertyStatus;
};
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => property_enum_1.PropertyStatus, { nullable: true }),
    __metadata("design:type", typeof (_h = typeof property_enum_1.PropertyStatus !== "undefined" && property_enum_1.PropertyStatus) === "function" ? _h : Object)
], APISearch.prototype, "propertyStatus", void 0);
APISearch = __decorate([
    (0, graphql_1.InputType)()
], APISearch);
let AgentPropertiesInquiry = class AgentPropertiesInquiry {
    page;
    limit;
    sort;
    direction;
    search;
};
exports.AgentPropertiesInquiry = AgentPropertiesInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AgentPropertiesInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AgentPropertiesInquiry.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(config_1.availablePropertySorts),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AgentPropertiesInquiry.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => common_enum_1.Direction, { nullable: true }),
    __metadata("design:type", typeof (_j = typeof common_enum_1.Direction !== "undefined" && common_enum_1.Direction) === "function" ? _j : Object)
], AgentPropertiesInquiry.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => APISearch),
    __metadata("design:type", APISearch)
], AgentPropertiesInquiry.prototype, "search", void 0);
exports.AgentPropertiesInquiry = AgentPropertiesInquiry = __decorate([
    (0, graphql_1.InputType)()
], AgentPropertiesInquiry);
let ALPISearch = class ALPISearch {
    propertyStatus;
    propertyLocationList;
};
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => property_enum_1.PropertyStatus, { nullable: true }),
    __metadata("design:type", typeof (_k = typeof property_enum_1.PropertyStatus !== "undefined" && property_enum_1.PropertyStatus) === "function" ? _k : Object)
], ALPISearch.prototype, "propertyStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => [property_enum_1.PropertyLocation], { nullable: true }),
    __metadata("design:type", Array)
], ALPISearch.prototype, "propertyLocationList", void 0);
ALPISearch = __decorate([
    (0, graphql_1.InputType)()
], ALPISearch);
let AllPropertiesInquiry = class AllPropertiesInquiry {
    page;
    limit;
    sort;
    direction;
    search;
};
exports.AllPropertiesInquiry = AllPropertiesInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AllPropertiesInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], AllPropertiesInquiry.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(config_1.availablePropertySorts),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AllPropertiesInquiry.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => common_enum_1.Direction, { nullable: true }),
    __metadata("design:type", typeof (_l = typeof common_enum_1.Direction !== "undefined" && common_enum_1.Direction) === "function" ? _l : Object)
], AllPropertiesInquiry.prototype, "direction", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => ALPISearch),
    __metadata("design:type", ALPISearch)
], AllPropertiesInquiry.prototype, "search", void 0);
exports.AllPropertiesInquiry = AllPropertiesInquiry = __decorate([
    (0, graphql_1.InputType)()
], AllPropertiesInquiry);
let OrdinaryInquiry = class OrdinaryInquiry {
    page;
    limit;
};
exports.OrdinaryInquiry = OrdinaryInquiry;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrdinaryInquiry.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrdinaryInquiry.prototype, "limit", void 0);
exports.OrdinaryInquiry = OrdinaryInquiry = __decorate([
    (0, graphql_1.InputType)()
], OrdinaryInquiry);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/property/property.ts":
/*!***********************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/property/property.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Properties = exports.Property = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const property_enum_1 = __webpack_require__(/*! ../../enums/property.enum */ "./apps/nestar-api/src/libs/enums/property.enum.ts");
const member_1 = __webpack_require__(/*! ../member/member */ "./apps/nestar-api/src/libs/dto/member/member.ts");
const like_1 = __webpack_require__(/*! ../like/like */ "./apps/nestar-api/src/libs/dto/like/like.ts");
let Property = class Property {
    _id;
    propertyType;
    propertyStatus;
    propertyLocation;
    propertyAddress;
    propertyTitle;
    propertyPrice;
    propertySquare;
    propertyBeds;
    propertyRooms;
    propertyViews;
    propertyLikes;
    propertyComments;
    propertyRank;
    propertyImages;
    propertyDesc;
    propertyBarter;
    propertyRent;
    memberId;
    soldAt;
    deletedAt;
    constructedAt;
    createdAt;
    updatedAt;
    meLiked;
    memberData;
};
exports.Property = Property;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Property.prototype, "_id", void 0);
__decorate([
    (0, graphql_1.Field)(() => property_enum_1.PropertyType),
    __metadata("design:type", typeof (_a = typeof property_enum_1.PropertyType !== "undefined" && property_enum_1.PropertyType) === "function" ? _a : Object)
], Property.prototype, "propertyType", void 0);
__decorate([
    (0, graphql_1.Field)(() => property_enum_1.PropertyStatus),
    __metadata("design:type", typeof (_b = typeof property_enum_1.PropertyStatus !== "undefined" && property_enum_1.PropertyStatus) === "function" ? _b : Object)
], Property.prototype, "propertyStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => property_enum_1.PropertyLocation),
    __metadata("design:type", typeof (_c = typeof property_enum_1.PropertyLocation !== "undefined" && property_enum_1.PropertyLocation) === "function" ? _c : Object)
], Property.prototype, "propertyLocation", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Property.prototype, "propertyAddress", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Property.prototype, "propertyTitle", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], Property.prototype, "propertyPrice", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], Property.prototype, "propertySquare", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Property.prototype, "propertyBeds", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Property.prototype, "propertyRooms", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Property.prototype, "propertyViews", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Property.prototype, "propertyLikes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Property.prototype, "propertyComments", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], Property.prototype, "propertyRank", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], Property.prototype, "propertyImages", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Property.prototype, "propertyDesc", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], Property.prototype, "propertyBarter", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], Property.prototype, "propertyRent", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", Object)
], Property.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Property.prototype, "soldAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], Property.prototype, "deletedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], Property.prototype, "constructedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_g = typeof Date !== "undefined" && Date) === "function" ? _g : Object)
], Property.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", typeof (_h = typeof Date !== "undefined" && Date) === "function" ? _h : Object)
], Property.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [like_1.MeLiked], { nullable: true }),
    __metadata("design:type", Array)
], Property.prototype, "meLiked", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_1.Member, { nullable: true }),
    __metadata("design:type", typeof (_j = typeof member_1.Member !== "undefined" && member_1.Member) === "function" ? _j : Object)
], Property.prototype, "memberData", void 0);
exports.Property = Property = __decorate([
    (0, graphql_1.ObjectType)()
], Property);
let Properties = class Properties {
    list;
    metaCounter;
};
exports.Properties = Properties;
__decorate([
    (0, graphql_1.Field)(() => [Property]),
    __metadata("design:type", Array)
], Properties.prototype, "list", void 0);
__decorate([
    (0, graphql_1.Field)(() => [member_1.TotalCounter], { nullable: true }),
    __metadata("design:type", Array)
], Properties.prototype, "metaCounter", void 0);
exports.Properties = Properties = __decorate([
    (0, graphql_1.ObjectType)()
], Properties);


/***/ }),

/***/ "./apps/nestar-api/src/libs/dto/property/property.update.ts":
/*!******************************************************************!*\
  !*** ./apps/nestar-api/src/libs/dto/property/property.update.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropertyUpdate = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const property_enum_1 = __webpack_require__(/*! ../../enums/property.enum */ "./apps/nestar-api/src/libs/enums/property.enum.ts");
const mongoose = __importStar(__webpack_require__(/*! mongoose */ "mongoose"));
let PropertyUpdate = class PropertyUpdate {
    _id;
    propertyType;
    propertyStatus;
    propertyLocation;
    propertyAddress;
    propertyTitle;
    propertyPrice;
    propertySquare;
    propertyBeds;
    propertyRooms;
    propertyImages;
    propertyDesc;
    propertyBarter;
    propertyRent;
    soldAt;
    deletedAt;
    constructedAt;
};
exports.PropertyUpdate = PropertyUpdate;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", typeof (_a = typeof mongoose !== "undefined" && mongoose.ObjectId) === "function" ? _a : Object)
], PropertyUpdate.prototype, "_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => property_enum_1.PropertyType, { nullable: true }),
    __metadata("design:type", typeof (_b = typeof property_enum_1.PropertyType !== "undefined" && property_enum_1.PropertyType) === "function" ? _b : Object)
], PropertyUpdate.prototype, "propertyType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => property_enum_1.PropertyStatus, { nullable: true }),
    __metadata("design:type", typeof (_c = typeof property_enum_1.PropertyStatus !== "undefined" && property_enum_1.PropertyStatus) === "function" ? _c : Object)
], PropertyUpdate.prototype, "propertyStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => property_enum_1.PropertyLocation, { nullable: true }),
    __metadata("design:type", typeof (_d = typeof property_enum_1.PropertyLocation !== "undefined" && property_enum_1.PropertyLocation) === "function" ? _d : Object)
], PropertyUpdate.prototype, "propertyLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(3, 100),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PropertyUpdate.prototype, "propertyAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(3, 100),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PropertyUpdate.prototype, "propertyTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], PropertyUpdate.prototype, "propertyPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], PropertyUpdate.prototype, "propertySquare", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], PropertyUpdate.prototype, "propertyBeds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], PropertyUpdate.prototype, "propertyRooms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], PropertyUpdate.prototype, "propertyImages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(5, 500),
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], PropertyUpdate.prototype, "propertyDesc", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], PropertyUpdate.prototype, "propertyBarter", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], PropertyUpdate.prototype, "propertyRent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], PropertyUpdate.prototype, "constructedAt", void 0);
exports.PropertyUpdate = PropertyUpdate = __decorate([
    (0, graphql_1.InputType)()
], PropertyUpdate);


/***/ }),

/***/ "./apps/nestar-api/src/libs/enums/board-article.enum.ts":
/*!**************************************************************!*\
  !*** ./apps/nestar-api/src/libs/enums/board-article.enum.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BoardArticleStatus = exports.BoardArticleCategory = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
var BoardArticleCategory;
(function (BoardArticleCategory) {
    BoardArticleCategory["FREE"] = "FREE";
    BoardArticleCategory["RECOMMEND"] = "RECOMMEND";
    BoardArticleCategory["NEWS"] = "NEWS";
    BoardArticleCategory["HUMOR"] = "HUMOR";
})(BoardArticleCategory || (exports.BoardArticleCategory = BoardArticleCategory = {}));
(0, graphql_1.registerEnumType)(BoardArticleCategory, {
    name: 'BoardArticleCategory',
});
var BoardArticleStatus;
(function (BoardArticleStatus) {
    BoardArticleStatus["ACTIVE"] = "ACTIVE";
    BoardArticleStatus["DELETE"] = "DELETE";
})(BoardArticleStatus || (exports.BoardArticleStatus = BoardArticleStatus = {}));
(0, graphql_1.registerEnumType)(BoardArticleStatus, {
    name: 'BoardArticleStatus',
});


/***/ }),

/***/ "./apps/nestar-api/src/libs/enums/comment.enum.ts":
/*!********************************************************!*\
  !*** ./apps/nestar-api/src/libs/enums/comment.enum.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommentGroup = exports.CommentStatus = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
var CommentStatus;
(function (CommentStatus) {
    CommentStatus["ACTIVE"] = "ACTIVE";
    CommentStatus["DELETE"] = "DELETE";
})(CommentStatus || (exports.CommentStatus = CommentStatus = {}));
(0, graphql_1.registerEnumType)(CommentStatus, {
    name: 'CommentStatus',
});
var CommentGroup;
(function (CommentGroup) {
    CommentGroup["MEMBER"] = "MEMBER";
    CommentGroup["ARTICLE"] = "ARTICLE";
    CommentGroup["PROPERTY"] = "PROPERTY";
})(CommentGroup || (exports.CommentGroup = CommentGroup = {}));
(0, graphql_1.registerEnumType)(CommentGroup, {
    name: 'CommentGroup',
});


/***/ }),

/***/ "./apps/nestar-api/src/libs/enums/common.enum.ts":
/*!*******************************************************!*\
  !*** ./apps/nestar-api/src/libs/enums/common.enum.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Direction = exports.Message = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
var Message;
(function (Message) {
    Message["SOMETHING_WENT_WRONG"] = "Something went wrong!";
    Message["NO_DATA_FOUND"] = "No data found!";
    Message["CREATE_FAILED"] = "Create failed!";
    Message["UPDATE_FAILED"] = "Update failed!";
    Message["REMOVE_FAILED"] = "Remove failed!";
    Message["UPLOAD_FAILED"] = "Upload failed!";
    Message["BAD_REQUEST"] = "Bad Request";
    Message["USED_MEMBER_NICK_OR_PHONE"] = "Already used member nick or phone";
    Message["NO_MEMBER_NICK"] = "No member with that member nick!";
    Message["BLOCKED_USER"] = "You have been blocked!";
    Message["WRONG_PASSWORD"] = "Wrong password, try again!";
    Message["NOT_AUTHENTICATED"] = "You are not authenticated, please login first!";
    Message["TOKEN_NOT_EXIST"] = "Bearer Token is not provided!";
    Message["ONLY_SPECIFIC_ROLES_ALLOWED"] = "Allowed only for members with specific role";
    Message["NOT_ALLOWED_REQUEST"] = "Not Allowed Request!";
    Message["PROVIDE_ALLOWED_FORMAT"] = "Please provide jpg, jpeg or png images!";
    Message["SELF_SUBSCRIPTION_DENIED"] = "Self subscription is denied!";
})(Message || (exports.Message = Message = {}));
var Direction;
(function (Direction) {
    Direction[Direction["ASC"] = 1] = "ASC";
    Direction[Direction["DESC"] = -1] = "DESC";
})(Direction || (exports.Direction = Direction = {}));
(0, graphql_1.registerEnumType)(Direction, { name: 'Direction' });


/***/ }),

/***/ "./apps/nestar-api/src/libs/enums/like.enum.ts":
/*!*****************************************************!*\
  !*** ./apps/nestar-api/src/libs/enums/like.enum.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LikeGroup = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
var LikeGroup;
(function (LikeGroup) {
    LikeGroup["MEMBER"] = "MEMBER";
    LikeGroup["PROPERTY"] = "PROPERTY";
    LikeGroup["ARTICLE"] = "ARTICLE";
})(LikeGroup || (exports.LikeGroup = LikeGroup = {}));
(0, graphql_1.registerEnumType)(LikeGroup, {
    name: 'LikeGroup',
});


/***/ }),

/***/ "./apps/nestar-api/src/libs/enums/member.enum.ts":
/*!*******************************************************!*\
  !*** ./apps/nestar-api/src/libs/enums/member.enum.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MemberAuthType = exports.MemberStatus = exports.MemberType = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
var MemberType;
(function (MemberType) {
    MemberType["USER"] = "USER";
    MemberType["AGENT"] = "AGENT";
    MemberType["ADMIN"] = "ADMIN";
})(MemberType || (exports.MemberType = MemberType = {}));
(0, graphql_1.registerEnumType)(MemberType, {
    name: 'MemberType',
});
var MemberStatus;
(function (MemberStatus) {
    MemberStatus["ACTIVE"] = "ACTIVE";
    MemberStatus["BLOCK"] = "BLOCK";
    MemberStatus["DELETE"] = "DELETE";
})(MemberStatus || (exports.MemberStatus = MemberStatus = {}));
(0, graphql_1.registerEnumType)(MemberStatus, {
    name: 'MemberStatus',
});
var MemberAuthType;
(function (MemberAuthType) {
    MemberAuthType["PHONE"] = "PHONE";
    MemberAuthType["EMAIL"] = "EMAIL";
    MemberAuthType["TELEGRAM"] = "TELEGRAM";
})(MemberAuthType || (exports.MemberAuthType = MemberAuthType = {}));
(0, graphql_1.registerEnumType)(MemberAuthType, {
    name: 'MemberAuthType',
});


/***/ }),

/***/ "./apps/nestar-api/src/libs/enums/property.enum.ts":
/*!*********************************************************!*\
  !*** ./apps/nestar-api/src/libs/enums/property.enum.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PropertyLocation = exports.PropertyStatus = exports.PropertyType = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
var PropertyType;
(function (PropertyType) {
    PropertyType["APARTMENT"] = "APARTMENT";
    PropertyType["VILLA"] = "VILLA";
    PropertyType["HOUSE"] = "HOUSE";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
(0, graphql_1.registerEnumType)(PropertyType, {
    name: 'PropertyType',
});
var PropertyStatus;
(function (PropertyStatus) {
    PropertyStatus["ACTIVE"] = "ACTIVE";
    PropertyStatus["SOLD"] = "SOLD";
    PropertyStatus["DELETE"] = "DELETE";
})(PropertyStatus || (exports.PropertyStatus = PropertyStatus = {}));
(0, graphql_1.registerEnumType)(PropertyStatus, {
    name: 'PropertyStatus',
});
var PropertyLocation;
(function (PropertyLocation) {
    PropertyLocation["SEOUL"] = "SEOUL";
    PropertyLocation["BUSAN"] = "BUSAN";
    PropertyLocation["INCHEON"] = "INCHEON";
    PropertyLocation["DAEGU"] = "DAEGU";
    PropertyLocation["GYEONGJU"] = "GYEONGJU";
    PropertyLocation["GWANGJU"] = "GWANGJU";
    PropertyLocation["CHONJU"] = "CHONJU";
    PropertyLocation["DAEJON"] = "DAEJON";
    PropertyLocation["JEJU"] = "JEJU";
})(PropertyLocation || (exports.PropertyLocation = PropertyLocation = {}));
(0, graphql_1.registerEnumType)(PropertyLocation, {
    name: 'PropertyLocation',
});


/***/ }),

/***/ "./apps/nestar-api/src/libs/enums/view.enum.ts":
/*!*****************************************************!*\
  !*** ./apps/nestar-api/src/libs/enums/view.enum.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ViewGroup = void 0;
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
var ViewGroup;
(function (ViewGroup) {
    ViewGroup["MEMBER"] = "MEMBER";
    ViewGroup["ARTICLE"] = "ARTICLE";
    ViewGroup["PROPERTY"] = "PROPERTY";
})(ViewGroup || (exports.ViewGroup = ViewGroup = {}));
(0, graphql_1.registerEnumType)(ViewGroup, {
    name: 'ViewGroup',
});


/***/ }),

/***/ "./apps/nestar-api/src/libs/interceptor/Logging.interceptor.ts":
/*!*********************************************************************!*\
  !*** ./apps/nestar-api/src/libs/interceptor/Logging.interceptor.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LoggingInterceptor = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const graphql_1 = __webpack_require__(/*! @nestjs/graphql */ "@nestjs/graphql");
const operators_1 = __webpack_require__(/*! rxjs/operators */ "rxjs/operators");
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger();
    intercept(context, next) {
        const recordTime = Date.now();
        const requestType = context.getType();
        if (requestType === 'http') {
        }
        else if (requestType === 'graphql') {
            const gqlContext = graphql_1.GqlExecutionContext.create(context);
            this.logger.log(`Type ${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');
        }
        return next
            .handle()
            .pipe((0, operators_1.tap)(() => {
            const responseTime = Date.now() - recordTime;
            this.logger.log(`${requestType} - ${responseTime}ms \n\n`, "RESPONSE");
        }));
    }
    stringify(context) {
        return JSON.stringify(context).slice(0, 75);
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);


/***/ }),

/***/ "./apps/nestar-api/src/main.ts":
/*!*************************************!*\
  !*** ./apps/nestar-api/src/main.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/nestar-api/src/app.module.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const Logging_interceptor_1 = __webpack_require__(/*! ./libs/interceptor/Logging.interceptor */ "./apps/nestar-api/src/libs/interceptor/Logging.interceptor.ts");
const graphql_upload_1 = __webpack_require__(/*! graphql-upload */ "graphql-upload");
const express = __importStar(__webpack_require__(/*! express */ "express"));
const platform_ws_1 = __webpack_require__(/*! @nestjs/platform-ws */ "@nestjs/platform-ws");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalInterceptors(new Logging_interceptor_1.LoggingInterceptor());
    app.enableCors({ origin: true, credentials: true });
    app.use((0, graphql_upload_1.graphqlUploadExpress)({ maxFileSize: 15000000, maxFiles: 10 }));
    app.use('/uploads', express.static('./uploads'));
    app.useWebSocketAdapter(new platform_ws_1.WsAdapter(app));
    await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();


/***/ }),

/***/ "./apps/nestar-api/src/schemas/BoardArticle.model.ts":
/*!***********************************************************!*\
  !*** ./apps/nestar-api/src/schemas/BoardArticle.model.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const board_article_enum_1 = __webpack_require__(/*! ../libs/enums/board-article.enum */ "./apps/nestar-api/src/libs/enums/board-article.enum.ts");
const BoardArticleSchema = new mongoose_1.Schema({
    articleCategory: {
        type: String,
        enum: board_article_enum_1.BoardArticleCategory,
        required: true,
    },
    articleStatus: {
        type: String,
        enum: board_article_enum_1.BoardArticleStatus,
        default: board_article_enum_1.BoardArticleStatus.ACTIVE,
    },
    articleTitle: {
        type: String,
        required: true,
    },
    articleContent: {
        type: String,
        required: true,
    },
    articleImage: {
        type: String,
    },
    articleLikes: {
        type: Number,
        default: 0,
    },
    articleViews: {
        type: Number,
        default: 0,
    },
    articleComments: {
        type: Number,
        default: 0,
    },
    memberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Member',
    },
}, { timestamps: true, collection: 'boardArticles' });
exports["default"] = BoardArticleSchema;


/***/ }),

/***/ "./apps/nestar-api/src/schemas/Comment.model.ts":
/*!******************************************************!*\
  !*** ./apps/nestar-api/src/schemas/Comment.model.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const comment_enum_1 = __webpack_require__(/*! ../libs/enums/comment.enum */ "./apps/nestar-api/src/libs/enums/comment.enum.ts");
const CommentSchema = new mongoose_1.Schema({
    commentStatus: {
        type: String,
        enum: comment_enum_1.CommentStatus,
        default: comment_enum_1.CommentStatus.ACTIVE,
    },
    commentGroup: {
        type: String,
        enum: comment_enum_1.CommentGroup,
        required: true,
    },
    commentContent: {
        type: String,
        required: true,
    },
    commentRefId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    memberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
}, { timestamps: true, collection: 'comments' });
exports["default"] = CommentSchema;


/***/ }),

/***/ "./apps/nestar-api/src/schemas/Follow.model.ts":
/*!*****************************************************!*\
  !*** ./apps/nestar-api/src/schemas/Follow.model.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const FollowSchema = new mongoose_1.Schema({
    followingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    followerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
}, { timestamps: true, collection: 'follows' });
FollowSchema.index({ followingId: 1, followerId: 1 }, { unique: true });
exports["default"] = FollowSchema;


/***/ }),

/***/ "./apps/nestar-api/src/schemas/Like.model.ts":
/*!***************************************************!*\
  !*** ./apps/nestar-api/src/schemas/Like.model.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const view_enum_1 = __webpack_require__(/*! ../libs/enums/view.enum */ "./apps/nestar-api/src/libs/enums/view.enum.ts");
const LikeSchema = new mongoose_1.Schema({
    likeGroup: {
        type: String,
        enum: view_enum_1.ViewGroup,
        required: true,
    },
    likeRefId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    memberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Member',
    },
}, { timestamps: true, collection: 'likes' });
LikeSchema.index({ memberId: 1, likeRefId: 1 }, { unique: true });
exports["default"] = LikeSchema;


/***/ }),

/***/ "./apps/nestar-api/src/schemas/Member.model.ts":
/*!*****************************************************!*\
  !*** ./apps/nestar-api/src/schemas/Member.model.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const member_enum_1 = __webpack_require__(/*! ../libs/enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const MemberSchema = new mongoose_1.Schema({
    memberType: {
        type: String,
        enum: member_enum_1.MemberType,
        default: member_enum_1.MemberType.USER,
    },
    memberStatus: {
        type: String,
        enum: member_enum_1.MemberStatus,
        default: member_enum_1.MemberStatus.ACTIVE,
    },
    memberAuthType: {
        type: String,
        enum: member_enum_1.MemberAuthType,
        default: member_enum_1.MemberAuthType.PHONE,
    },
    memberPhone: {
        type: String,
        index: { unique: true, sparse: true },
        required: true,
    },
    memberNick: {
        type: String,
        index: { unique: true, sparse: true },
        required: true,
    },
    memberPassword: {
        type: String,
        select: false,
        required: true,
    },
    memberFullName: {
        type: String,
    },
    memberImage: {
        type: String,
        default: '',
    },
    memberAddress: {
        type: String,
    },
    memberDesc: {
        type: String,
    },
    memberProperties: {
        type: Number,
        default: 0,
    },
    memberArticles: {
        type: Number,
        default: 0,
    },
    memberFollowers: {
        type: Number,
        default: 0,
    },
    memberFollowings: {
        type: Number,
        default: 0,
    },
    memberPoints: {
        type: Number,
        default: 0,
    },
    memberLikes: {
        type: Number,
        default: 0,
    },
    memberViews: {
        type: Number,
        default: 0,
    },
    memberComments: {
        type: Number,
        default: 0,
    },
    memberRank: {
        type: Number,
        default: 0,
    },
    memberWarnings: {
        type: Number,
        default: 0,
    },
    memberBlocks: {
        type: Number,
        default: 0,
    },
    deletedAt: {
        type: Date,
    },
}, { timestamps: true, collection: 'members' });
exports["default"] = MemberSchema;


/***/ }),

/***/ "./apps/nestar-api/src/schemas/Property.model.ts":
/*!*******************************************************!*\
  !*** ./apps/nestar-api/src/schemas/Property.model.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const property_enum_1 = __webpack_require__(/*! ../libs/enums/property.enum */ "./apps/nestar-api/src/libs/enums/property.enum.ts");
const PropertySchema = new mongoose_1.Schema({
    propertyType: {
        type: String,
        enum: property_enum_1.PropertyType,
        required: true,
    },
    propertyStatus: {
        type: String,
        enum: property_enum_1.PropertyStatus,
        default: property_enum_1.PropertyStatus.ACTIVE,
    },
    propertyLocation: {
        type: String,
        enum: property_enum_1.PropertyLocation,
        required: true,
    },
    propertyAddress: {
        type: String,
        required: true,
    },
    propertyTitle: {
        type: String,
        required: true,
    },
    propertyPrice: {
        type: Number,
        required: true,
    },
    propertySquare: {
        type: Number,
        required: true,
    },
    propertyBeds: {
        type: Number,
        required: true,
    },
    propertyRooms: {
        type: Number,
        required: true,
    },
    propertyViews: {
        type: Number,
        default: 0,
    },
    propertyLikes: {
        type: Number,
        default: 0,
    },
    propertyComments: {
        type: Number,
        default: 0,
    },
    propertyRank: {
        type: Number,
        default: 0,
    },
    propertyImages: {
        type: [String],
        required: true,
    },
    propertyDesc: {
        type: String,
    },
    propertyBarter: {
        type: Boolean,
        default: false,
    },
    propertyRent: {
        type: Boolean,
        default: false,
    },
    memberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Member',
    },
    soldAt: {
        type: Date,
    },
    deletedAt: {
        type: Date,
    },
    constructedAt: {
        type: Date,
    },
}, { timestamps: true, collection: 'properties' });
PropertySchema.index({ propertyType: 1, propertyLocation: 1, propertyTitle: 1, propertyPrice: 1 }, { unique: true });
exports["default"] = PropertySchema;


/***/ }),

/***/ "./apps/nestar-api/src/schemas/View.model.ts":
/*!***************************************************!*\
  !*** ./apps/nestar-api/src/schemas/View.model.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const mongoose_1 = __webpack_require__(/*! mongoose */ "mongoose");
const view_enum_1 = __webpack_require__(/*! ../libs/enums/view.enum */ "./apps/nestar-api/src/libs/enums/view.enum.ts");
const ViewSchema = new mongoose_1.Schema({
    viewGroup: {
        type: String,
        enum: view_enum_1.ViewGroup,
        required: true,
    },
    viewRefId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    memberId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Member',
    },
}, { timestamps: true, collection: 'views' });
ViewSchema.index({ memberId: 1, viewRefId: 1 }, { unique: true });
exports["default"] = ViewSchema;


/***/ }),

/***/ "./apps/nestar-api/src/socket/socket.gateway.ts":
/*!******************************************************!*\
  !*** ./apps/nestar-api/src/socket/socket.gateway.ts ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SocketGateway = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const websockets_1 = __webpack_require__(/*! @nestjs/websockets */ "@nestjs/websockets");
let SocketGateway = class SocketGateway {
    logger = new common_1.Logger('SocketEventsGateway');
    summaryClient = 0;
    afterInit(server) {
        this.logger.log(`WebSocket Server Initialized total: ${this.summaryClient}`);
    }
    handleConnection(client, ...args) {
        this.summaryClient++;
        this.logger.log(`== Client connected total: ${this.summaryClient} ==`);
    }
    handleDisconnect(client) {
        this.summaryClient--;
        this.logger.log(`== Client disconnected left total: ${this.summaryClient} ==`);
    }
    handleMessage(client, payload) {
        return 'Hello world!';
    }
};
exports.SocketGateway = SocketGateway;
__decorate([
    (0, websockets_1.SubscribeMessage)('message'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_a = typeof WebSocket !== "undefined" && WebSocket) === "function" ? _a : Object, Object]),
    __metadata("design:returntype", String)
], SocketGateway.prototype, "handleMessage", null);
exports.SocketGateway = SocketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ transports: ['websocket'], secure: false })
], SocketGateway);


/***/ }),

/***/ "./apps/nestar-api/src/socket/socket.module.ts":
/*!*****************************************************!*\
  !*** ./apps/nestar-api/src/socket/socket.module.ts ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SocketModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const socket_gateway_1 = __webpack_require__(/*! ./socket.gateway */ "./apps/nestar-api/src/socket/socket.gateway.ts");
let SocketModule = class SocketModule {
};
exports.SocketModule = SocketModule;
exports.SocketModule = SocketModule = __decorate([
    (0, common_1.Module)({
        providers: [socket_gateway_1.SocketGateway]
    })
], SocketModule);


/***/ }),

/***/ "@nestjs/apollo":
/*!*********************************!*\
  !*** external "@nestjs/apollo" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/apollo");

/***/ }),

/***/ "@nestjs/axios":
/*!********************************!*\
  !*** external "@nestjs/axios" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/graphql":
/*!**********************************!*\
  !*** external "@nestjs/graphql" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/graphql");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/mongoose":
/*!***********************************!*\
  !*** external "@nestjs/mongoose" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),

/***/ "@nestjs/platform-ws":
/*!**************************************!*\
  !*** external "@nestjs/platform-ws" ***!
  \**************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-ws");

/***/ }),

/***/ "@nestjs/websockets":
/*!*************************************!*\
  !*** external "@nestjs/websockets" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("@nestjs/websockets");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "graphql-upload":
/*!*********************************!*\
  !*** external "graphql-upload" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("graphql-upload");

/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("moment");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "rxjs/operators":
/*!*********************************!*\
  !*** external "rxjs/operators" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("rxjs/operators");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./apps/nestar-api/src/main.ts");
/******/ 	
/******/ })()
;