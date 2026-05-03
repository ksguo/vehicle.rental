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
            return aParts.join(" · ");
        },

        formatDate: function (oDate) {
            if (!oDate) { return "–"; }
            var d = (oDate instanceof Date) ? oDate : new Date(oDate);
            if (isNaN(d.getTime())) { return "–"; }
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return String(d.getDate()).padStart(2, "0") + " " + months[d.getMonth()] + " " + d.getFullYear();
        },

        formatMileage: function (nMileage) {
            if (nMileage === null || nMileage === undefined || nMileage === "") { return ""; }
            var n = parseInt(nMileage, 10);
            return isNaN(n) ? "" : n.toLocaleString("en-US") + " km";
        },

        rentalStatusText: function (sStatus) {
            switch (sStatus) {
                case "ACTIVE": return "Active";
                case "OPEN":   return "Open";
                case "CLOSED": return "Closed";
                default:       return sStatus || "";
            }
        }
    };
});
