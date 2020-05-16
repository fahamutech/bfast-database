"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DaaSConfig = (function () {
    function DaaSConfig() {
    }
    DaaSConfig.getInstance = function () {
        if (this.instance) {
            return this.instance;
        }
        else {
            this.instance = new DaaSConfig();
            return this.instance;
        }
    };
    DaaSConfig.prototype.addValues = function (config) {
        Object.assign(this, config);
    };
    return DaaSConfig;
}());
exports.DaaSConfig = DaaSConfig;
