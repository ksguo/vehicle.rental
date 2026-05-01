sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, MessageToast) {
    "use strict";

    var VEHICLE_SET = "/Vehicle";
    var RENTAL_SET  = "/Rental";
    var FN_CONFIRM  = "/confirmRental";
    var FN_CLOSE    = "/closeRental";

    return Controller.extend("z00196ss26.vehicle.rental.controller.Main", {

        onInit: function () {
            this.getView().setModel(new JSONModel({}), "dialog");
        },

        // ================================================================
        // VEHICLE — FILTER / OVERVIEW
        // ================================================================

        onVehicleFilterChange: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oBinding = this.byId("vehicleTable").getBinding("items");
            if (sKey === "ALL") {
                oBinding.filter([]);
            } else {
                oBinding.filter([new Filter("Availability", FilterOperator.EQ, sKey === "true")]);
            }
        },

        onVehicleTableUpdate: function (oEvent) {
            var iTotal = oEvent.getParameter("total");
            this.byId("vehicleCount").setText(
                this._i18n("vehicleCountLabel") + ": " + iTotal
            );
        },

        // ================================================================
        // VEHICLE — CRUD
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
                    title: this._i18n("editVehicle"), isNew: false,
                    VehicleId: o.VehicleId, Brand: o.Brand, Model: o.Model,
                    Category: o.Category, FuelType: o.FuelType, Transmission: o.Transmission,
                    DailyRate: o.DailyRate, CurrencyCode: o.CurrencyCode,
                    Mileage: o.Mileage, Availability: o.Availability,
                    _path: oContext.getPath()
                };
            } else {
                oData = {
                    title: this._i18n("addVehicle"), isNew: true,
                    VehicleId: "", Brand: "", Model: "",
                    Category: "ECONOMY", FuelType: "PETROL", Transmission: "MANUAL",
                    DailyRate: "0.00", CurrencyCode: "EUR",
                    Mileage: 0, Availability: true,
                    _path: null
                };
            }
            this.getView().getModel("dialog").setData(oData);
            this._getDialog("vehicle").then(function (d) { d.open(); });
        },

        onSaveVehicle: function () {
            var oModel = this.getView().getModel();
            var d = this.getView().getModel("dialog").getData();

            if (!d.VehicleId || !d.Brand || !d.Model || !d.Category) {
                MessageBox.error(this._i18n("mandatoryFieldsError"));
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
                oModel.create(VEHICLE_SET, oPayload, {
                    success: function () {
                        MessageToast.show(this._i18n("vehicleSaved"));
                        this._closeDialog("vehicle");
                        oModel.refresh();
                    }.bind(this),
                    error: function (oErr) {
                        this._showError(oErr, this._i18n("saveError"));
                    }.bind(this)
                });
            } else {
                oModel.update(d._path, oPayload, {
                    success: function () {
                        MessageToast.show(this._i18n("vehicleUpdated"));
                        this._closeDialog("vehicle");
                    }.bind(this),
                    error: function (oErr) {
                        this._showError(oErr, this._i18n("saveError"));
                    }.bind(this)
                });
            }
        },

        onDeleteVehicle: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var oModel = this.getView().getModel();
            MessageBox.confirm(this._i18n("deleteVehicleConfirm"), {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oModel.remove(sPath, {
                            success: function () { MessageToast.show(this._i18n("vehicleDeleted")); }.bind(this),
                            error: function (oErr) { this._showError(oErr, this._i18n("deleteError")); }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        // ================================================================
        // RENTAL — CRUD
        // ================================================================

        onAddRental: function () {
            this._openRentalDialog(null);
        },

        onEditRental: function (oEvent) {
            this._openRentalDialog(oEvent.getSource().getBindingContext());
        },

        _openRentalDialog: function (oContext) {
            var oData;
            if (oContext) {
                var o = oContext.getObject();
                oData = {
                    title: this._i18n("editRental"), isNew: false,
                    RentalId: o.RentalId, VehicleId: o.VehicleId,
                    CustomerName: o.CustomerName,
                    PickupDate: o.PickupDate, ReturnDate: o.ReturnDate,
                    SpecialRequests: o.SpecialRequests || "",
                    _path: oContext.getPath()
                };
            } else {
                oData = {
                    title: this._i18n("addRental"), isNew: true,
                    RentalId: "", VehicleId: "", CustomerName: "",
                    PickupDate: "", ReturnDate: "", SpecialRequests: "",
                    _path: null
                };
            }
            this.getView().getModel("dialog").setData(oData);
            this._getDialog("rental").then(function (d) { d.open(); });
        },

        onSaveRental: function () {
            var oModel = this.getView().getModel();
            var d = this.getView().getModel("dialog").getData();

            if (!d.RentalId || !d.VehicleId || !d.CustomerName || !d.PickupDate || !d.ReturnDate) {
                MessageBox.error(this._i18n("mandatoryFieldsError"));
                return;
            }

            var oPayload = {
                RentalId: d.RentalId, VehicleId: d.VehicleId,
                CustomerName: d.CustomerName,
                PickupDate: d.PickupDate, ReturnDate: d.ReturnDate,
                SpecialRequests: d.SpecialRequests || ""
            };

            if (d.isNew) {
                oModel.create(RENTAL_SET, oPayload, {
                    success: function () {
                        MessageToast.show(this._i18n("rentalSaved"));
                        this._closeDialog("rental");
                        oModel.refresh();
                    }.bind(this),
                    error: function (oErr) {
                        this._showError(oErr, this._i18n("saveError"));
                    }.bind(this)
                });
            } else {
                oModel.update(d._path, oPayload, {
                    success: function () {
                        MessageToast.show(this._i18n("rentalUpdated"));
                        this._closeDialog("rental");
                    }.bind(this),
                    error: function (oErr) {
                        this._showError(oErr, this._i18n("saveError"));
                    }.bind(this)
                });
            }
        },

        onDeleteRental: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext().getPath();
            var oModel = this.getView().getModel();
            MessageBox.confirm(this._i18n("deleteRentalConfirm"), {
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        oModel.remove(sPath, {
                            success: function () {
                                MessageToast.show(this._i18n("rentalDeleted"));
                                oModel.refresh();
                            }.bind(this),
                            error: function (oErr) { this._showError(oErr, this._i18n("deleteError")); }.bind(this)
                        });
                    }
                }.bind(this)
            });
        },

        // ================================================================
        // RENTAL — ACTIONS (OData V2 Function Imports)
        // ================================================================

        onConfirmRental: function (oEvent) {
            var oObj = oEvent.getSource().getBindingContext().getObject();
            this._callRentalAction(FN_CONFIRM, oObj.RentalId, this._i18n("rentalConfirmed"));
        },

        onCloseRental: function (oEvent) {
            var oObj = oEvent.getSource().getBindingContext().getObject();
            this._callRentalAction(FN_CLOSE, oObj.RentalId, this._i18n("rentalClosed"));
        },

        _callRentalAction: function (sFn, sRentalId, sSuccessMsg) {
            var oModel = this.getView().getModel();
            oModel.callFunction(sFn, {
                method: "POST",
                urlParameters: { RentalId: sRentalId },
                success: function () {
                    MessageToast.show(sSuccessMsg);
                    oModel.refresh();
                },
                error: function (oErr) {
                    this._showError(oErr, this._i18n("actionError"));
                }.bind(this)
            });
        },

        // ================================================================
        // HELPERS
        // ================================================================

        onCancelDialog: function (oEvent) {
            this.getView().getModel().resetChanges();
            oEvent.getSource().getParent().close();
        },

        _getDialog: function (sType) {
            var sName = "z00196ss26.vehicle.rental.view.fragment." +
                (sType === "vehicle" ? "VehicleDialog" : "RentalDialog");
            var sKey = "_o" + sType + "Dlg";
            if (!this[sKey]) {
                return this.loadFragment({ name: sName }).then(function (oDialog) {
                    this[sKey] = oDialog;
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return Promise.resolve(this[sKey]);
        },

        _closeDialog: function (sType) {
            var sKey = "_o" + sType + "Dlg";
            if (this[sKey]) { this[sKey].close(); }
        },

        _showError: function (oError, sFallback) {
            var sMsg = sFallback;
            try {
                var oBody = JSON.parse(oError.responseText);
                sMsg = oBody.error.message.value || sFallback;
            } catch (e) { /* fallback */ }
            MessageBox.error(sMsg);
        },

        _i18n: function (sKey) {
            return this.getView().getModel("i18n").getResourceBundle().getText(sKey);
        }
    });
});
