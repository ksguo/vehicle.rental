sap.ui.define([], function () {
    "use strict";

    return {

        availabilityText: function (bAvailable) {
            return bAvailable ? "Available" : "Rented";
        },

        availabilityState: function (bAvailable) {
            return bAvailable ? "Success" : "Error";
        },

        availabilityIcon: function (bAvailable) {
            return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
        },

        categoryState: function (sCategory) {
            switch (sCategory) {
                case "LUXURY":  return "Information";
                case "SUV":     return "Success";
                case "VAN":     return "Warning";
                default:        return "None";
            }
        },

        rentalStatusState: function (sStatus) {
            switch (sStatus) {
                case "ACTIVE":  return "Success";
                case "OPEN":    return "Warning";
                case "CLOSED":  return "None";
                default:        return "None";
            }
        },

        rentalStatusIcon: function (sStatus) {
            switch (sStatus) {
                case "ACTIVE":  return "sap-icon://accept";
                case "OPEN":    return "sap-icon://pending";
                case "CLOSED":  return "sap-icon://complete";
                default:        return "";
            }
        },

        specsText: function (sFuel, sTrans) {
            var aParts = [];
            if (sFuel) { aParts.push(sFuel); }
            if (sTrans) { aParts.push(sTrans); }
            return aParts.join(" | ");
        }
    };
});
