const currencyFmt = '$0,0.00';
Vue.component('currency-input', {
    props: ['labeltext', 'field', 'value', 'readonly'],
    template: `
        <div class="form-group">
            <label v-text="labeltext"></label>
            <input class="form-control" type="text" v-model="displayValue" @blur="isInputActive = false" @focus="isInputActive = true" :readonly="readonly" />
        </div>`,
    data: function () {
        return {
            isInputActive: false
        }
    },
    computed: {
        displayValue: {
            get: function () {
                if (this.isInputActive) {
                    // Cursor is inside the input field. unformat display value for user
                    return numeral(this.value).value();
                } else {
                    // User is not modifying now. Format display value for user interface
                    return numeral(this.value).format(currencyFmt);
                }
            },
            set: function (modifiedValue) {
                // Recalculate value after ignoring "$" and "," in user input
                let newValue = numeral(modifiedValue).value();
                // Ensure that it is not NaN
                if (isNaN(newValue)) {
                    newValue = 0;
                }
                // Note: we cannot set this.value as it is a "prop". It needs to be passed to parent component
                // $emit the event so that parent component gets it
                this.$emit('input', { field: this.field, value: newValue });
            }
        }
    }
});