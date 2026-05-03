sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/FeedListItem"
], function (BaseController, JSONModel, FeedListItem) {
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

            this._aVehicles = [];
            this._aRentals = [];

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
                    this._aVehicles = a;
                    var iAvail = a.filter(function (v) { return v.Availability; }).length;
                    var fTotalRate = 0;
                    a.forEach(function (v) { fTotalRate += parseFloat(v.DailyRate) || 0; });
                    oDash.setProperty("/vehicleCount", a.length);
                    oDash.setProperty("/availableCount", iAvail);
                    oDash.setProperty("/rentedCount", a.length - iAvail);
                    oDash.setProperty("/availablePercent", a.length ? Math.round(iAvail / a.length * 100) : 0);
                    oDash.setProperty("/avgRate", a.length ? (fTotalRate / a.length).toFixed(0) + " EUR" : "0 EUR");
                }.bind(this)
            });

            oModel.read("/Rental", {
                success: function (oData) {
                    var a = oData.results;
                    this._aRentals = a;
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
                }.bind(this)
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

        onCloseAiDialog: function () {
            var oDialog = this.byId("dashAiDialog");
            if (oDialog) { oDialog.close(); }
        },

        // ════════════════════════════════════════════════════
        // AI ASSISTANT
        // ════════════════════════════════════════════════════

        onHeroAiSend: function (oEvent) {
            var oInput = this.byId("dashHeroInput");
            var sValue = (oEvent.getParameter("value") || (oInput ? oInput.getValue() : "") || "").trim();
            if (sValue) {
                this._addChatMessage(sValue, true);
                this._callAi(sValue);
                if (oInput) { oInput.setValue(""); }
            }
            var oDialog = this.byId("dashAiDialog");
            if (oDialog) { oDialog.open(); }
        },

        onHeroChipPress: function (oEvent) {
            var sQuery = oEvent.getSource().getText();
            this._addChatMessage(sQuery, true);
            this._callAi(sQuery);
            var oDialog = this.byId("dashAiDialog");
            if (oDialog) { oDialog.open(); }
        },

        onAiPost: function (oEvent) {
            var sValue = (oEvent.getParameter("value") || "").trim();
            if (!sValue) { return; }
            this._addChatMessage(sValue, true);
            this._callAi(sValue);
        },

        onBookingChipPress: function () {
            this._addChatMessage("Book a vehicle", true);
            this._addChatMessage("Describe what you need — vehicle type, pickup date, duration, and budget. For example: 'I need an SUV for 5 days from May 6, budget 300 EUR/day'.", false);
            var oFeed = this.byId("dashAiFeedInput");
            if (oFeed) { oFeed.setPlaceholder("e.g. I need an SUV for 5 days from May 6, budget 300 EUR"); }
            var oDialog = this.byId("dashAiDialog");
            if (oDialog) { oDialog.open(); }
        },

        _callAi: function (sQuery) {
            var that = this;
            var oList = this.byId("dashAiChatList");
            var oModel = this.getOwnerComponent().getModel();

            var sRentalId = this._aRentals.length > 0 ? this._aRentals[0].RentalId : null;
            if (!sRentalId) {
                this._addChatMessage("⚠ No rental data loaded yet — please refresh.", false);
                return;
            }

            var oThinking = new FeedListItem({
                sender: "Fleet AI",
                text: "Thinking",
                showIcon: true,
                icon: "sap-icon://discussion-2",
                senderActive: false
            }).addStyleClass("aiThinking");
            oList.addItem(oThinking);

            var removeThinking = function () {
                oList.removeItem(oThinking);
                oThinking.destroy();
            };

            oModel.callFunction("/AskFleetAI", {
                method: "POST",
                urlParameters: {
                    RentalId: sRentalId,
                    UserQuestion: sQuery
                },
                success: function (oData) {
                    removeThinking();
                    var oResult = oData.AskFleetAI || oData;
                    if (oResult.Success === true || oResult.Success === "X") {
                        that._addChatMessage(oResult.Answer || "(empty response)", false);
                    } else {
                        that._addChatMessage("⚠ " + (oResult.ErrorMessage || "AI error"), false);
                    }
                },
                error: function () {
                    removeThinking();
                    that._addChatMessage("⚠ Request failed", false);
                }
            });
        },

        _addChatMessage: function (sText, bIsUser) {
            var oList = this.byId("dashAiChatList");
            if (!oList) { return; }
            oList.addItem(new FeedListItem({
                sender:       bIsUser ? "You" : "Fleet AI",
                text:         sText,
                showIcon:     !bIsUser,
                icon:         bIsUser ? undefined : "sap-icon://discussion-2",
                senderActive: false,
                timestamp:    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }));
        }
    });
});
