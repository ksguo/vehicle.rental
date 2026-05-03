sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/HBox",
    "sap/m/Text"
], function (BaseController, JSONModel, HBox, Text) {
    "use strict";

    return BaseController.extend("z00196ss26.vehicle.rental.controller.Dashboard", {

        onInit: function () {
            this.setModel(new JSONModel({
                vehicleCount: 0,
                availableCount: 0,
                rentedCount: 0,
                availablePercent: 0,
                activeCount: 0,
                openCount: 0,
                closedCount: 0,
                totalRevenue: "0.00",
                totalRentals: 0,
                avgRate: "0.00"
            }), "dashboard");

            this.getOwnerComponent().getModel().metadataLoaded().then(function () {
                this._loadDashboardData();
            }.bind(this));
        },

        _loadDashboardData: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oDash = this.getModel("dashboard");

            oModel.read("/Vehicle", {
                success: function (oData) {
                    var a = oData.results;
                    var iAvail = a.filter(function (v) { return v.Availability; }).length;
                    var fTotalRate = 0;
                    a.forEach(function (v) { fTotalRate += parseFloat(v.DailyRate) || 0; });
                    oDash.setProperty("/vehicleCount", a.length);
                    oDash.setProperty("/availableCount", iAvail);
                    oDash.setProperty("/rentedCount", a.length - iAvail);
                    oDash.setProperty("/availablePercent", a.length ? Math.round(iAvail / a.length * 100) : 0);
                    oDash.setProperty("/avgRate", a.length ? (fTotalRate / a.length).toFixed(0) + " EUR" : "0 EUR");
                }
            });

            oModel.read("/Rental", {
                success: function (oData) {
                    var a = oData.results;
                    var iActive = 0, iOpen = 0, iClosed = 0, fRev = 0;
                    a.forEach(function (r) {
                        if (r.Status === "ACTIVE") { iActive++; }
                        else if (r.Status === "OPEN") { iOpen++; }
                        else if (r.Status === "CLOSED") { iClosed++; }
                        fRev += parseFloat(r.TotalPrice) || 0;
                    });
                    oDash.setProperty("/activeCount", iActive);
                    oDash.setProperty("/openCount", iOpen);
                    oDash.setProperty("/closedCount", iClosed);
                    oDash.setProperty("/totalRevenue", fRev.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                    oDash.setProperty("/totalRentals", a.length);
                }
            });
        },

        onRefreshDashboard: function () {
            this.getOwnerComponent().getModel().refresh();
            this._loadDashboardData();
        },

        onNavToVehicles: function () {
            this.getRouter().navTo("VehicleList");
        },

        onNavToRentals: function () {
            this.getRouter().navTo("RentalList");
        },

        onOpenAiDialog: function () {
            var oDialog = this.byId("dashAiDialog");
            if (oDialog) {
                oDialog.open();
            }
        },

        onCloseAiDialog: function () {
            var oDialog = this.byId("dashAiDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onAiSend: function () {
            var oInput = this.byId("dashAiDialogInputField");
            var oMessages = this.byId("dashAiDialogMessages");
            if (!oInput || !oMessages) {
                return;
            }

            var sValue = (oInput.getValue() || "").trim();
            if (!sValue) {
                return;
            }

            var oUserText = new Text({ text: sValue }).addStyleClass("heroAiText");
            var oUserBubble = new HBox({ justifyContent: "End" })
                .addStyleClass("heroAiBubble")
                .addStyleClass("heroAiBubbleUser")
                .addItem(oUserText);

            var oBotText = new Text({ text: "Got it. AI reply is a demo here." }).addStyleClass("heroAiText");
            var oBotBubble = new HBox()
                .addStyleClass("heroAiBubble")
                .addStyleClass("heroAiBubbleBot")
                .addItem(oBotText);

            oMessages.addItem(oUserBubble);
            oMessages.addItem(oBotBubble);
            oInput.setValue("");
        }
    });
});
