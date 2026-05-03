sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("z00196ss26.vehicle.rental.controller.BaseController", {

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
            this.getView().setModel(oModel, sName);
            return this;
        },

        i18n: function (sKey, aArgs) {
            return this.getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        },

        onNavBack: function () {
            this.getRouter().navTo("Dashboard");
        },

        showError: function (oError, sFallbackKey) {
            var sMsg = this.i18n(sFallbackKey);
            try {
                sMsg = JSON.parse(oError.responseText).error.message.value || sMsg;
            } catch { /* use fallback */ }
            MessageBox.error(sMsg);
        },

        showSuccess: function (sKey) {
            MessageToast.show(this.i18n(sKey));
        },

        parseDate: function (sDate) {
            if (!sDate) { return null; }
            if (sDate instanceof Date) { return sDate; }
            var a = sDate.split("-");
            return new Date(parseInt(a[0], 10), parseInt(a[1], 10) - 1, parseInt(a[2], 10));
        }
    });
});
