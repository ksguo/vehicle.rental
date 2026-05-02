sap.ui.define([
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (BaseController, formatter, JSONModel, Filter, FilterOperator, MessageBox) {
    "use strict";

    return BaseController.extend("z00196ss26.vehicle.rental.controller.VehicleList", {

        formatter: formatter,

        onInit: function () {
            this.setModel(new JSONModel({}), "dialog");
            this.setModel(new JSONModel({
                allCount: 0,
                availableCount: 0,
                rentedCount: 0
            }), "vehicleView");

            this._sFilterKey = "ALL";
            this._sSearchQuery = "";

            this.getRouter().getRoute("VehicleList").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this._updateCounts();
        },

        // ================================================================
        // SEARCH & FILTER
        // ================================================================

        onSearchVehicle: function (oEvent) {
            this._sSearchQuery = oEvent.getParameter("newValue");
            this._applyFilters();
        },

        onFilterVehicle: function (oEvent) {
            this._sFilterKey = oEvent.getParameter("key");
            this._applyFilters();
        },

        _applyFilters: function () {
            var aFilters = [];

            if (this._sFilterKey && this._sFilterKey !== "ALL") {
                aFilters.push(new Filter("Availability", FilterOperator.EQ, this._sFilterKey === "true"));
            }

            if (this._sSearchQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("Brand", FilterOperator.Contains, this._sSearchQuery),
                        new Filter("Model", FilterOperator.Contains, this._sSearchQuery),
                        new Filter("VehicleId", FilterOperator.Contains, this._sSearchQuery)
                    ],
                    and: false
                }));
            }

            this.byId("vehicleTable").getBinding("items").filter(aFilters);
        },

        onTableUpdate: function () {},

        onRefresh: function () {
            this.getModel().refresh();
            this._updateCounts();
        },

        _updateCounts: function () {
            this.getModel().read("/Vehicle", {
                success: function (oData) {
                    var a = oData.results;
                    var iAvail = a.filter(function (v) { return v.Availability; }).length;
                    this.getModel("vehicleView").setData({
                        allCount: a.length,
                        availableCount: iAvail,
                        rentedCount: a.length - iAvail
                    });
                }.bind(this)
            });
        },

        // ================================================================
        // BOOK FROM VEHICLE LIST
        // ================================================================

        onBookVehicle: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oVehicle = oContext.getObject();

            this.getModel("dialog").setData({
                title: this.i18n("bookNow") + " – " + oVehicle.Brand + " " + oVehicle.Model,
                isNew: true,
                RentalId: "",
                VehicleId: oVehicle.VehicleId,
                vehicleIdEnabled: false,
                vehicleInfo: oVehicle.Brand + " " + oVehicle.Model + "  |  " + oVehicle.DailyRate + " " + oVehicle.CurrencyCode + " / day",
                CustomerName: "",
                PickupDate: "",
                ReturnDate: "",
                SpecialRequests: "",
                _path: null
            });

            this._getRentalDialog().then(function (d) { d.open(); });
        },

        onSaveRental: function () {
            var oModel = this.getModel();
            var d = this.getModel("dialog").getData();

            if (!d.RentalId || !d.VehicleId || !d.CustomerName || !d.PickupDate || !d.ReturnDate) {
                MessageBox.error(this.i18n("mandatoryFieldsError"));
                return;
            }

            oModel.create("/Rental", {
                RentalId: d.RentalId,
                VehicleId: d.VehicleId,
                CustomerName: d.CustomerName,
                PickupDate: this.parseDate(d.PickupDate),
                ReturnDate: this.parseDate(d.ReturnDate),
                SpecialRequests: d.SpecialRequests || ""
            }, {
                success: function () {
                    this.showSuccess("rentalSaved");
                    this._oRentalDialog.close();
                    oModel.refresh();
                    this._updateCounts();
                }.bind(this),
                error: function (e) { this.showError(e, "saveError"); }.bind(this)
            });
        },

        // ================================================================
        // VEHICLE CRUD
        // ================================================================

        onAddVehicle: function () {
            this._openVehicleDialog(null);
        },

        onEditVehicle: function (oEvent) {
            this._openVehicleDialog(oEvent.getSource().getBindingContext());
        },

        _openVehicleDialog: function (oContext) {
            var oData;
            if (oContext) {
                var o = oContext.getObject();
                oData = {
                    title: this.i18n("editVehicle"), isNew: false,
                    VehicleId: o.VehicleId, Brand: o.Brand, Model: o.Model,
                    Category: o.Category, FuelType: o.FuelType, Transmission: o.Transmission,
                    DailyRate: o.DailyRate, CurrencyCode: o.CurrencyCode,
                    Mileage: o.Mileage, Availability: o.Availability,
                    _path: oContext.getPath()
                };
            } else {
                oData = {
                    title: this.i18n("addVehicle"), isNew: true,
                    VehicleId: "", Brand: "", Model: "",
                    Category: "ECONOMY", FuelType: "PETROL", Transmission: "MANUAL",
                    DailyRate: "0.00", CurrencyCode: "EUR",
                    Mileage: 0, Availability: true,
                    _path: null
                };
            }
            this.getModel("dialog").setData(oData);
            this._getVehicleDialog().then(function (d) { d.open(); });
        },

        onSaveVehicle: function () {
            var oModel = this.getModel();
            var d = this.getModel("dialog").getData();

            if (!d.VehicleId || !d.Brand || !d.Model || !d.Category) {
                MessageBox.error(this.i18n("mandatoryFieldsError"));
                return;
            }

            var oPayload = {
                VehicleId: d.VehicleId, Brand: d.Brand, Model: d.Model,
                Category: d.Category, FuelType: d.FuelType, Transmission: d.Transmission,
                DailyRate: d.DailyRate ? d.DailyRate.toString() : "0.00",
                CurrencyCode: d.CurrencyCode || "EUR",
                Mileage: parseInt(d.Mileage) || 0, Availability: d.Availability
            };

            if (d.isNew) {
                oModel.create("/Vehicle", oPayload, {
                    success: function () {
                        this.showSuccess("vehicleSaved");
                        this._oVehicleDialog.close();
                        oModel.refresh();
                        this._updateCounts();
                    }.bind(this),
                    error: function (e) { this.showError(e, "saveError"); }.bind(this)
                });
            } else {
                oModel.update(d._path, oPayload, {
                    success: function () {
                        this.showSuccess("vehicleUpdated");
                        this._oVehicleDialog.close();
                        this._updateCounts();
                    }.bind(this),
                    error: function (e) { this.showError(e, "saveError"); }.bind(this)
                });
            }
        },

        onDeleteVehicle: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var oModel = this.getModel();
            MessageBox.confirm(this.i18n("deleteVehicleConfirm"), {
                onClose: function (a) {
                    if (a === MessageBox.Action.OK) {
                        oModel.remove(sPath, {
                            success: function () {
                                this.showSuccess("vehicleDeleted");
                                this._updateCounts();
                            }.bind(this),
                            error: function (e) { this.showError(e, "deleteError"); }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        onCancelDialog: function () {
            this.getModel().resetChanges();
            if (this._oRentalDialog && this._oRentalDialog.isOpen()) {
                this._oRentalDialog.close();
            } else if (this._oVehicleDialog && this._oVehicleDialog.isOpen()) {
                this._oVehicleDialog.close();
            }
        },

        // ================================================================
        // DIALOG HELPERS
        // ================================================================

        _getVehicleDialog: function () {
            if (!this._oVehicleDialog) {
                return this.loadFragment({
                    name: "z00196ss26.vehicle.rental.view.fragment.VehicleDialog"
                }).then(function (oDialog) {
                    this._oVehicleDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return Promise.resolve(this._oVehicleDialog);
        },

        _getRentalDialog: function () {
            if (!this._oRentalDialog) {
                return this.loadFragment({
                    id: "bookingDialog",
                    name: "z00196ss26.vehicle.rental.view.fragment.RentalDialog"
                }).then(function (oDialog) {
                    this._oRentalDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return Promise.resolve(this._oRentalDialog);
        }
    });
});
