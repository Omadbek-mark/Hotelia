/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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

/***/ "./apps/nestar-batch/src/batch.controller.ts":
/*!***************************************************!*\
  !*** ./apps/nestar-batch/src/batch.controller.ts ***!
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
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BatchController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const batch_service_1 = __webpack_require__(/*! ./batch.service */ "./apps/nestar-batch/src/batch.service.ts");
const schedule_1 = __webpack_require__(/*! @nestjs/schedule */ "@nestjs/schedule");
const config_1 = __webpack_require__(/*! ./lib/config */ "./apps/nestar-batch/src/lib/config.ts");
let BatchController = class BatchController {
    batchService;
    logger = new common_1.Logger('BatchController');
    constructor(batchService) {
        this.batchService = batchService;
    }
    handleTimeout() {
        this.logger.debug(('BATCH SERVER READY!'));
    }
    async batchRollback() {
        try {
            this.logger['context'] = config_1.BATCH_ROLLBACK;
            this.logger.debug('Executed');
            await this.batchService.batchRollback();
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    async batchProperties() {
        try {
            this.logger['context'] = config_1.BATCH_TOP_PROPERTIES;
            this.logger.debug('Executed');
            await this.batchService.batchTopProperties();
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    async batchAgents() {
        try {
            this.logger['context'] = config_1.BATCH_TOP_AGENTS;
            this.logger.debug('Executed');
            await this.batchService.batchTopAgents();
        }
        catch (err) {
            this.logger.error(err);
        }
    }
    getHello() {
        return this.batchService.getHello();
    }
};
exports.BatchController = BatchController;
__decorate([
    (0, schedule_1.Timeout)(1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BatchController.prototype, "handleTimeout", null);
__decorate([
    (0, schedule_1.Cron)('00 * * * * *', { name: config_1.BATCH_ROLLBACK }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BatchController.prototype, "batchRollback", null);
__decorate([
    (0, schedule_1.Cron)('20 * * * * *', { name: config_1.BATCH_TOP_PROPERTIES }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BatchController.prototype, "batchProperties", null);
__decorate([
    (0, schedule_1.Cron)('40 * * * * *', { name: config_1.BATCH_TOP_AGENTS }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BatchController.prototype, "batchAgents", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], BatchController.prototype, "getHello", null);
exports.BatchController = BatchController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof batch_service_1.BatchService !== "undefined" && batch_service_1.BatchService) === "function" ? _a : Object])
], BatchController);


/***/ }),

/***/ "./apps/nestar-batch/src/batch.module.ts":
/*!***********************************************!*\
  !*** ./apps/nestar-batch/src/batch.module.ts ***!
  \***********************************************/
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
exports.BatchModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const database_module_1 = __webpack_require__(/*! ./database/database.module */ "./apps/nestar-batch/src/database/database.module.ts");
const schedule_1 = __webpack_require__(/*! @nestjs/schedule */ "@nestjs/schedule");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const Property_model_1 = __importDefault(__webpack_require__(/*! apps/nestar-api/src/schemas/Property.model */ "./apps/nestar-api/src/schemas/Property.model.ts"));
const Member_model_1 = __importDefault(__webpack_require__(/*! apps/nestar-api/src/schemas/Member.model */ "./apps/nestar-api/src/schemas/Member.model.ts"));
const batch_controller_1 = __webpack_require__(/*! ./batch.controller */ "./apps/nestar-batch/src/batch.controller.ts");
const batch_service_1 = __webpack_require__(/*! ./batch.service */ "./apps/nestar-batch/src/batch.service.ts");
let BatchModule = class BatchModule {
};
exports.BatchModule = BatchModule;
exports.BatchModule = BatchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            database_module_1.DatabaseModule,
            schedule_1.ScheduleModule.forRoot(),
            mongoose_1.MongooseModule.forFeature([{ name: 'Property', schema: Property_model_1.default }]),
            mongoose_1.MongooseModule.forFeature([{ name: 'Member', schema: Member_model_1.default }]),
        ],
        controllers: [batch_controller_1.BatchController],
        providers: [batch_service_1.BatchService],
    })
], BatchModule);


/***/ }),

/***/ "./apps/nestar-batch/src/batch.service.ts":
/*!************************************************!*\
  !*** ./apps/nestar-batch/src/batch.service.ts ***!
  \************************************************/
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
exports.BatchService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const mongoose_1 = __webpack_require__(/*! @nestjs/mongoose */ "@nestjs/mongoose");
const member_enum_1 = __webpack_require__(/*! apps/nestar-api/src/libs/enums/member.enum */ "./apps/nestar-api/src/libs/enums/member.enum.ts");
const property_enum_1 = __webpack_require__(/*! apps/nestar-api/src/libs/enums/property.enum */ "./apps/nestar-api/src/libs/enums/property.enum.ts");
const mongoose_2 = __webpack_require__(/*! mongoose */ "mongoose");
let BatchService = class BatchService {
    propertyModel;
    memberModel;
    constructor(propertyModel, memberModel) {
        this.propertyModel = propertyModel;
        this.memberModel = memberModel;
    }
    getHello() {
        return 'Welcome Nestar Batch server!';
    }
    async batchRollback() {
        await this.propertyModel
            .updateMany({
            propertyStatus: property_enum_1.PropertyStatus.ACTIVE,
        }, { propertyRank: 0 })
            .exec();
        await this.memberModel
            .updateMany({
            memberStatus: member_enum_1.MemberStatus.ACTIVE,
            memberType: member_enum_1.MemberType.AGENT,
        }, { memberRank: 0 })
            .exec();
    }
    async batchTopProperties() {
        const properties = await this.propertyModel
            .find({
            propertyStatus: property_enum_1.PropertyStatus.ACTIVE,
            propertyRank: 0,
        })
            .exec();
        const promisedList = properties.map(async (ele) => {
            const { _id, propertyLikes, propertyViews } = ele;
            const rank = propertyLikes * 2 + propertyViews * 1;
            return await this.propertyModel.findByIdAndUpdate(_id, { propertyRank: rank });
        });
        await Promise.all(promisedList);
    }
    async batchTopAgents() {
        const agents = await this.memberModel
            .find({
            memberType: member_enum_1.MemberType.AGENT,
            memberStatus: member_enum_1.MemberStatus.ACTIVE,
            memberRank: 0,
        })
            .exec();
        const promisedList = agents.map(async (ele) => {
            const { _id, memberProperties, memberLikes, memberArticles, memberViews } = ele;
            const rank = memberProperties * 4 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
            return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
        });
        await Promise.all(promisedList);
    }
};
exports.BatchService = BatchService;
exports.BatchService = BatchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Property')),
    __param(1, (0, mongoose_1.InjectModel)('Member')),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object, typeof (_b = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _b : Object])
], BatchService);


/***/ }),

/***/ "./apps/nestar-batch/src/database/database.module.ts":
/*!***********************************************************!*\
  !*** ./apps/nestar-batch/src/database/database.module.ts ***!
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

/***/ "./apps/nestar-batch/src/lib/config.ts":
/*!*********************************************!*\
  !*** ./apps/nestar-batch/src/lib/config.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BATCH_TOP_AGENTS = exports.BATCH_TOP_PROPERTIES = exports.BATCH_ROLLBACK = void 0;
exports.BATCH_ROLLBACK = 'BATCH_ROLLBACK';
exports.BATCH_TOP_PROPERTIES = 'BATCH_TOP_PROPERTIES';
exports.BATCH_TOP_AGENTS = 'BATCH_TOP_AGENTS';


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

/***/ "@nestjs/mongoose":
/*!***********************************!*\
  !*** external "@nestjs/mongoose" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/mongoose");

/***/ }),

/***/ "@nestjs/schedule":
/*!***********************************!*\
  !*** external "@nestjs/schedule" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/schedule");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

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
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!***************************************!*\
  !*** ./apps/nestar-batch/src/main.ts ***!
  \***************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const batch_module_1 = __webpack_require__(/*! ./batch.module */ "./apps/nestar-batch/src/batch.module.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(batch_module_1.BatchModule);
    await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();

})();

/******/ })()
;