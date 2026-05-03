/* global Promise */
sap.ui.define([
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (BaseController, formatter, JSONModel, Filter, FilterOperator, MessageBox) {
    "use strict";

    return BaseController.extend("z00196ss26.vehicle.rental.controller.RentalList", {

        formatter: formatter,

        onInit: function () {
            this.setModel(new JSONModel({}), "dialog");
            this.setModel(new JSONModel({
                allCount: 0,
                openCount: 0,
                activeCount: 0,
                closedCount: 0
            }), "rentalView");

            this._sFilterKey = "ALL";
            this._sSearchQuery = "";

            this.getRouter().getRoute("RentalList").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._updateCounts();
        },

        // ================================================================
        // SEARCH & FILTER
        // ================================================================

        onSearchRental: function (oEvent) {
            this._sSearchQuery = oEvent.getParameter("newValue");
            this._applyFilters();
        },

        onFilterRental: function (oEvent) {
            this._sFilterKey = oEvent.getParameter("key");
            this._applyFilters();
        },

        _applyFilters: function () {
            var aFilters = [];

            if (this._sFilterKey && this._sFilterKey !== "ALL") {
                aFilters.push(new Filter("Status", FilterOperator.EQ, this._sFilterKey));
            }

            if (this._sSearchQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("CustomerName", FilterOperator.Contains, this._sSearchQuery),
                        new Filter("RentalId", FilterOperator.Contains, this._sSearchQuery),
                        new Filter("VehicleId", FilterOperator.Contains, this._sSearchQuery)
                    ],
                    and: false
                }));
            }

            this.byId("rentalTable").getBinding("items").filter(aFilters);
        },

        onTableUpdate: function () {},

        onRefresh: function () {
            this.getModel().refresh();
            this._updateCounts();
        },

        _updateCounts: function () {
            this.getModel().read("/Rental", {
                success: function (oData) {
                    var a = oData.results;
                    var iOpen = 0, iActive = 0, iClosed = 0;
                    a.forEach(function (r) {
                        if (r.Status === "OPEN") { iOpen++; }
                        else if (r.Status === "ACTIVE") { iActive++; }
                        else if (r.Status === "CLOSED") { iClosed++; }
                    });
                    this.getModel("rentalView").setData({
                        allCount: a.length,
                        openCount: iOpen,
                        activeCount: iActive,
                        closedCount: iClosed
                    });
                }.bind(this)
            });
        },

        // ================================================================
        // CRUD
        // ================================================================

        onAddRental: function () {
            this._openDialog(null);
        },

        onEditRental: function (oEvent) {
            this._openDialog(oEvent.getSource().getBindingContext());
        },

        _openDialog: function (oContext) {
            var oData;
            if (oContext) {
                var o = oContext.getObject();
                oData = {
                    title: this.i18n("editRental"), isNew: false,
                    RentalId: o.RentalId, VehicleId: o.VehicleId,
                    vehicleIdEnabled: false,
                    vehicleInfo: "",
                    CustomerName: o.CustomerName,
                    PickupDate: o.PickupDate, ReturnDate: o.ReturnDate,
                    SpecialRequests: o.SpecialRequests || "",
                    _path: oContext.getPath()
                };
            } else {
                oData = {
                    title: this.i18n("addRental"), isNew: true,
                    RentalId: "", VehicleId: "",
                    vehicleIdEnabled: true,
                    vehicleInfo: "",
                    CustomerName: "",
                    PickupDate: "", ReturnDate: "",
                    SpecialRequests: "",
                    _path: null
                };
            }
            this.getModel("dialog").setData(oData);
            this._getFragmentDialog().then(function (d) { d.open(); });
        },

        onSaveRental: function () {
            var oModel = this.getModel();
            var d = this.getModel("dialog").getData();

            if (!d.RentalId || !d.VehicleId || !d.CustomerName || !d.PickupDate || !d.ReturnDate) {
                MessageBox.error(this.i18n("mandatoryFieldsError"));
                return;
            }

            var oPayload = {
                RentalId: d.RentalId, VehicleId: d.VehicleId,
                CustomerName: d.CustomerName,
                PickupDate: this.parseDate(d.PickupDate),
                ReturnDate: this.parseDate(d.ReturnDate),
                SpecialRequests: d.SpecialRequests || ""
            };

            if (d.isNew) {
                oModel.create("/Rental", oPayload, {
                    success: function () {
                        this.showSuccess("rentalSaved");
                        this._oDialog.close();
                        oModel.refresh();
                        this._updateCounts();
                    }.bind(this),
                    error: function (e) { this.showError(e, "saveError"); }.bind(this)
                });
            } else {
                oModel.update(d._path, oPayload, {
                    success: function () {
                        this.showSuccess("rentalUpdated");
                        this._oDialog.close();
                        this._updateCounts();
                    }.bind(this),
                    error: function (e) { this.showError(e, "saveError"); }.bind(this)
                });
            }
        },

        onDeleteRental: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var oModel = this.getModel();
            MessageBox.confirm(this.i18n("deleteRentalConfirm"), {
                onClose: function (a) {
                    if (a === MessageBox.Action.OK) {
                        oModel.remove(sPath, {
                            success: function () {
                                this.showSuccess("rentalDeleted");
                                oModel.refresh();
                                this._updateCounts();
                            }.bind(this),
                            error: function (e) { this.showError(e, "deleteError"); }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        // ================================================================
        // ACTIONS (OData V2 Function Imports)
        // ================================================================

        onConfirmRental: function (oEvent) {
            var o = oEvent.getSource().getBindingContext().getObject();
            this._callAction("/confirmRental", o.RentalId, "rentalConfirmed");
        },

        onCloseRental: function (oEvent) {
            var o = oEvent.getSource().getBindingContext().getObject();
            this._callAction("/closeRental", o.RentalId, "rentalClosed");
        },

        _callAction: function (sFn, sRentalId, sSuccessKey) {
            var oModel = this.getModel();
            oModel.callFunction(sFn, {
                method: "POST",
                urlParameters: { RentalId: sRentalId },
                success: function () {
                    this.showSuccess(sSuccessKey);
                    oModel.refresh();
                    this._updateCounts();
                }.bind(this),
                error: function (e) { this.showError(e, "actionError"); }.bind(this)
            });
        },

        // ================================================================
        // HELPERS
        // ================================================================

        onCancelDialog: function () {
            this.getModel().resetChanges();
            if (this._oDialog) { this._oDialog.close(); }
        },

        _getFragmentDialog: function () {
            if (!this._oDialog) {
                return this.loadFragment({
                    name: "z00196ss26.vehicle.rental.view.fragment.RentalDialog"
                }).then(function (oDialog) {
                    this._oDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return Promise.resolve(this._oDialog);
        }
    });
});
