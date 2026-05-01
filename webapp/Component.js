sap.ui.define([
    "sap/ui/core/UIComponent",
    "z00196ss26/vehicle/rental/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("z00196ss26.vehicle.rental.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});