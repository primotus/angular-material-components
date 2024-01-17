import { Component, EventEmitter, forwardRef, Input, Optional, Output, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { createMissingDateImplError, DEFAULT_STEP, formatTwoDigitTimeValue, LIMIT_TIMES, MERIDIANS, NUMERIC_REGEX, PATTERN_INPUT_HOUR, PATTERN_INPUT_MINUTE, PATTERN_INPUT_SECOND } from './utils/date-utils';
import * as i0 from "@angular/core";
import * as i1 from "./core/date-adapter";
import * as i2 from "@angular/forms";
import * as i3 from "@angular/common";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/icon";
import * as i7 from "@angular/material/button";
export class NgxMatTimepickerComponent {
    constructor(_dateAdapter, cd, formBuilder) {
        this._dateAdapter = _dateAdapter;
        this.cd = cd;
        this.formBuilder = formBuilder;
        this.disabled = false;
        this.showSpinners = true;
        this.stepHour = DEFAULT_STEP;
        this.stepMinute = DEFAULT_STEP;
        this.stepSecond = DEFAULT_STEP;
        this.showSeconds = false;
        this.disableMinute = false;
        this.enableMeridian = false;
        this.color = 'primary';
        this.modelChanged = new EventEmitter();
        this.meridian = MERIDIANS.AM;
        this._onChange = () => { };
        this._onTouched = () => { };
        this._destroyed = new Subject();
        this.pattern = PATTERN_INPUT_HOUR;
        if (!this._dateAdapter) {
            throw createMissingDateImplError('NgxMatDateAdapter');
        }
        this.form = this.formBuilder.group({
            hour: [{ value: null, disabled: this.disabled }, [Validators.required, Validators.pattern(PATTERN_INPUT_HOUR)]],
            minute: [{ value: null, disabled: this.disabled }, [Validators.required, Validators.pattern(PATTERN_INPUT_MINUTE)]],
            second: [{ value: null, disabled: this.disabled }, [Validators.required, Validators.pattern(PATTERN_INPUT_SECOND)]]
        });
    }
    /** Hour */
    get hour() {
        let val = Number(this.form.controls['hour'].value);
        return isNaN(val) ? 0 : val;
    }
    ;
    get minute() {
        let val = Number(this.form.controls['minute'].value);
        return isNaN(val) ? 0 : val;
    }
    ;
    get second() {
        let val = Number(this.form.controls['second'].value);
        return isNaN(val) ? 0 : val;
    }
    ;
    /** Whether or not the form is valid */
    get valid() {
        return this.form.valid;
    }
    ngOnInit() {
        this.form.valueChanges.pipe(takeUntil(this._destroyed), debounceTime(400)).subscribe(val => {
            this._updateModel();
        });
    }
    ngOnChanges(changes) {
        if (changes.disabled || changes.disableMinute) {
            this._setDisableStates();
        }
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Writes a new value to the element.
     * @param obj
     */
    writeValue(val) {
        if (val != null) {
            this._model = val;
            this._updateHourMinuteSecond();
        }
    }
    /** Registers a callback function that is called when the control's value changes in the UI. */
    registerOnChange(fn) {
        this._onChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event.
     */
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    /** Enables or disables the appropriate DOM element */
    setDisabledState(isDisabled) {
        this._disabled = isDisabled;
        this.cd.markForCheck();
    }
    /**
     * Format input
     * @param input
     */
    formatInput(input) {
        input.value = input.value.replace(NUMERIC_REGEX, '');
    }
    /** Toggle meridian */
    toggleMeridian() {
        this.meridian = (this.meridian === MERIDIANS.AM) ? MERIDIANS.PM : MERIDIANS.AM;
        this.change('hour');
    }
    /** Change property of time */
    change(prop, up) {
        const next = this._getNextValueByProp(prop, up);
        this.form.controls[prop].setValue(formatTwoDigitTimeValue(next), { onlySelf: false, emitEvent: false });
        this._updateModel();
    }
    /** Update controls of form by model */
    _updateHourMinuteSecond() {
        let _hour = this._dateAdapter.getHour(this._model);
        const _minute = this._dateAdapter.getMinute(this._model);
        const _second = this._dateAdapter.getSecond(this._model);
        if (this.enableMeridian) {
            if (_hour >= LIMIT_TIMES.meridian) {
                _hour = _hour - LIMIT_TIMES.meridian;
                this.meridian = MERIDIANS.PM;
            }
            else {
                this.meridian = MERIDIANS.AM;
            }
            if (_hour === 0) {
                _hour = LIMIT_TIMES.meridian;
            }
        }
        this.form.patchValue({
            hour: formatTwoDigitTimeValue(_hour),
            minute: formatTwoDigitTimeValue(_minute),
            second: formatTwoDigitTimeValue(_second)
        }, {
            emitEvent: false
        });
    }
    /** Update model */
    _updateModel() {
        let _hour = this.hour;
        if (this.enableMeridian) {
            if (this.meridian === MERIDIANS.AM && _hour === LIMIT_TIMES.meridian) {
                _hour = 0;
            }
            else if (this.meridian === MERIDIANS.PM && _hour !== LIMIT_TIMES.meridian) {
                _hour = _hour + LIMIT_TIMES.meridian;
            }
        }
        if (this._model) {
            let clonedModel = this._dateAdapter.clone(this._model);
            clonedModel = this._dateAdapter.setHour(clonedModel, _hour);
            clonedModel = this._dateAdapter.setMinute(clonedModel, this.minute);
            clonedModel = this._dateAdapter.setSecond(clonedModel, this.second);
            this._onChange(clonedModel);
            console.log("Emitiendo: ", clonedModel);
            this.modelChanged.emit(clonedModel);
        }
        else {
            if (this.form.controls['hour'].value && this.form.controls['minute'].value && this.form.controls['second'].value) {
                const d = this._dateAdapter.today();
                let clonedModel = this._dateAdapter.clone(d);
                clonedModel = this._dateAdapter.setHour(clonedModel, _hour);
                clonedModel = this._dateAdapter.setMinute(clonedModel, this.minute);
                clonedModel = this._dateAdapter.setSecond(clonedModel, this.second);
                this.writeValue(clonedModel);
                this._onChange(clonedModel);
                this.modelChanged.emit(clonedModel);
            }
        }
    }
    /**
     * Get next value by property
     * @param prop
     * @param up
     */
    _getNextValueByProp(prop, up) {
        const keyProp = prop[0].toUpperCase() + prop.slice(1);
        const min = LIMIT_TIMES[`min${keyProp}`];
        let max = LIMIT_TIMES[`max${keyProp}`];
        if (prop === 'hour' && this.enableMeridian) {
            max = LIMIT_TIMES.meridian;
        }
        let next;
        if (up == null) {
            next = this[prop] % (max);
            if (prop === 'hour' && this.enableMeridian) {
                if (next === 0)
                    next = max;
            }
        }
        else {
            next = up ? this[prop] + this[`step${keyProp}`] : this[prop] - this[`step${keyProp}`];
            if (prop === 'hour' && this.enableMeridian) {
                next = next % (max + 1);
                if (next === 0)
                    next = up ? 1 : max;
            }
            else {
                next = next % max;
            }
            if (up) {
                next = next > max ? (next - max + min) : next;
            }
            else {
                next = next < min ? (next - min + max) : next;
            }
        }
        return next;
    }
    /**
     * Set disable states
     */
    _setDisableStates() {
        if (this.disabled) {
            this.form.disable();
        }
        else {
            this.form.enable();
            if (this.disableMinute) {
                this.form.get('minute').disable();
                if (this.showSeconds) {
                    this.form.get('second').disable();
                }
            }
        }
    }
}
/** @nocollapse */ NgxMatTimepickerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.0.2", ngImport: i0, type: NgxMatTimepickerComponent, deps: [{ token: i1.NgxMatDateAdapter, optional: true }, { token: i0.ChangeDetectorRef }, { token: i2.FormBuilder }], target: i0.ɵɵFactoryTarget.Component });
/** @nocollapse */ NgxMatTimepickerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.0.2", type: NgxMatTimepickerComponent, selector: "ngx-mat-timepicker", inputs: { disabled: "disabled", showSpinners: "showSpinners", stepHour: "stepHour", stepMinute: "stepMinute", stepSecond: "stepSecond", showSeconds: "showSeconds", disableMinute: "disableMinute", enableMeridian: "enableMeridian", defaultTime: "defaultTime", color: "color" }, outputs: { modelChanged: "modelChanged" }, host: { classAttribute: "ngx-mat-timepicker" }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef((() => NgxMatTimepickerComponent)),
            multi: true
        }
    ], exportAs: ["ngxMatTimepicker"], usesOnChanges: true, ngImport: i0, template: "<form [formGroup]=\"form\">\n  <table class=\"ngx-mat-timepicker-table\">\n    <tbody class=\"ngx-mat-timepicker-tbody\">\n      <tr *ngIf=\"showSpinners\">\n        <td>\n          <button type=\"button\" mat-icon-button aria-label=\"expand_less icon\" (click)=\"change('hour', true)\"\n            [disabled]=\"disabled\">\n            <mat-icon>expand_less</mat-icon>\n          </button>\n        </td>\n        <td></td>\n        <td>\n          <button type=\"button\" mat-icon-button aria-label=\"expand_less icon\" (click)=\"change('minute', true)\"\n            [disabled]=\"disabled || disableMinute\">\n            <mat-icon>expand_less</mat-icon>\n          </button> </td>\n        <td></td>\n        <td *ngIf=\"showSeconds\">\n          <button type=\"button\" mat-icon-button aria-label=\"expand_less icon\" (click)=\"change('second', true)\"\n            [disabled]=\"disabled || disableMinute\">\n            <mat-icon>expand_less</mat-icon>\n          </button>\n        </td>\n        <td *ngIf=\"enableMeridian\" class=\"ngx-mat-timepicker-spacer\"></td>\n        <td *ngIf=\"enableMeridian\"></td>\n      </tr>\n\n      <tr>\n        <td>\n          <mat-form-field appearance=\"fill\" [color]=\"color\">\n            <input type=\"text\" matInput (input)=\"formatInput($any($event).target)\" maxlength=\"2\" formControlName=\"hour\"\n              (keydown.ArrowUp)=\"change('hour', true); $event.preventDefault()\"\n              (keydown.ArrowDown)=\"change('hour', false); $event.preventDefault()\" (blur)=\"change('hour')\">\n          </mat-form-field>\n        </td>\n        <td class=\"ngx-mat-timepicker-spacer\">&#58;</td>\n        <td>\n          <mat-form-field appearance=\"fill\" [color]=\"color\">\n            <input type=\"text\" matInput (input)=\"formatInput($any($event).target)\" maxlength=\"2\"\n              formControlName=\"minute\" (keydown.ArrowUp)=\"change('minute', true); $event.preventDefault()\"\n              (keydown.ArrowDown)=\"change('minute', false); $event.preventDefault()\" (blur)=\"change('minute')\">\n          </mat-form-field>\n        </td>\n        <td *ngIf=\"showSeconds\" class=\"ngx-mat-timepicker-spacer\">&#58;</td>\n        <td *ngIf=\"showSeconds\">\n          <mat-form-field appearance=\"fill\" [color]=\"color\">\n            <input type=\"text\" matInput (input)=\"formatInput($any($event).target)\" maxlength=\"2\"\n              formControlName=\"second\" (keydown.ArrowUp)=\"change('second', true); $event.preventDefault()\"\n              (keydown.ArrowDown)=\"change('second', false); $event.preventDefault()\" (blur)=\"change('second')\">\n          </mat-form-field>\n        </td>\n\n        <td *ngIf=\"enableMeridian\" class=\"ngx-mat-timepicker-spacer\"></td>\n        <td *ngIf=\"enableMeridian\" class=\"ngx-mat-timepicker-meridian\">\n          <button mat-button (click)=\"toggleMeridian()\" mat-stroked-button [color]=\"color\" [disabled]=\"disabled\">\n            {{meridian}}\n          </button>\n        </td>\n      </tr>\n\n      <tr *ngIf=\"showSpinners\">\n        <td>\n          <button type=\"button\" mat-icon-button aria-label=\"expand_more icon\" (click)=\"change('hour', false)\"\n            [disabled]=\"disabled\">\n            <mat-icon>expand_more</mat-icon>\n          </button> </td>\n        <td></td>\n        <td>\n          <button type=\"button\" mat-icon-button aria-label=\"expand_more icon\" (click)=\"change('minute', false)\"\n            [disabled]=\"disabled || disableMinute\">\n            <mat-icon>expand_more</mat-icon>\n          </button> </td>\n        <td *ngIf=\"showSeconds\"></td>\n        <td *ngIf=\"showSeconds\">\n          <button type=\"button\" mat-icon-button aria-label=\"expand_more icon\" (click)=\"change('second', false)\"\n            [disabled]=\"disabled || disableMinute\">\n            <mat-icon>expand_more</mat-icon>\n          </button>\n        </td>\n        <td *ngIf=\"enableMeridian\" class=\"ngx-mat-timepicker-spacer\"></td>\n        <td *ngIf=\"enableMeridian\"></td>\n      </tr>\n    </tbody>\n  </table>\n</form>", styles: [".ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td{text-align:center;height:10px}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td.ngx-mat-timepicker-spacer{font-weight:700}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td.ngx-mat-timepicker-meridian .mdc-button{min-width:64px;line-height:36px;min-width:0;border-radius:50%;width:36px;height:36px;padding:0;flex-shrink:0}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-icon-button{height:24px;width:24px;line-height:24px;padding:0}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-icon-button .mat-icon{font-size:24px}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field{width:24px;max-width:24px;text-align:center}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field.mat-focused .mdc-text-field--filled .mat-mdc-form-field-focus-overlay,.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field:hover .mdc-text-field--filled .mat-mdc-form-field-focus-overlay{background-color:transparent}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field .mdc-text-field--filled{background-color:transparent!important;padding:0!important}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field .mdc-text-field--filled .mat-mdc-form-field-infix{padding:4px 0;min-height:1px!important}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field .mdc-text-field--filled .mat-mdc-form-field-infix input{text-align:center;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "directive", type: i4.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i2.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i2.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i2.MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: ["maxlength"] }, { kind: "directive", type: i2.FormGroupDirective, selector: "[formGroup]", inputs: ["formGroup"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "directive", type: i2.FormControlName, selector: "[formControlName]", inputs: ["formControlName", "disabled", "ngModel"], outputs: ["ngModelChange"] }, { kind: "component", type: i6.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "component", type: i7.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { kind: "component", type: i7.MatIconButton, selector: "button[mat-icon-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }], encapsulation: i0.ViewEncapsulation.None });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.0.2", ngImport: i0, type: NgxMatTimepickerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-mat-timepicker', host: {
                        'class': 'ngx-mat-timepicker'
                    }, providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef((() => NgxMatTimepickerComponent)),
                            multi: true
                        }
                    ], exportAs: 'ngxMatTimepicker', encapsulation: ViewEncapsulation.None, template: "<form [formGroup]=\"form\">\n  <table class=\"ngx-mat-timepicker-table\">\n    <tbody class=\"ngx-mat-timepicker-tbody\">\n      <tr *ngIf=\"showSpinners\">\n        <td>\n          <button type=\"button\" mat-icon-button aria-label=\"expand_less icon\" (click)=\"change('hour', true)\"\n            [disabled]=\"disabled\">\n            <mat-icon>expand_less</mat-icon>\n          </button>\n        </td>\n        <td></td>\n        <td>\n          <button type=\"button\" mat-icon-button aria-label=\"expand_less icon\" (click)=\"change('minute', true)\"\n            [disabled]=\"disabled || disableMinute\">\n            <mat-icon>expand_less</mat-icon>\n          </button> </td>\n        <td></td>\n        <td *ngIf=\"showSeconds\">\n          <button type=\"button\" mat-icon-button aria-label=\"expand_less icon\" (click)=\"change('second', true)\"\n            [disabled]=\"disabled || disableMinute\">\n            <mat-icon>expand_less</mat-icon>\n          </button>\n        </td>\n        <td *ngIf=\"enableMeridian\" class=\"ngx-mat-timepicker-spacer\"></td>\n        <td *ngIf=\"enableMeridian\"></td>\n      </tr>\n\n      <tr>\n        <td>\n          <mat-form-field appearance=\"fill\" [color]=\"color\">\n            <input type=\"text\" matInput (input)=\"formatInput($any($event).target)\" maxlength=\"2\" formControlName=\"hour\"\n              (keydown.ArrowUp)=\"change('hour', true); $event.preventDefault()\"\n              (keydown.ArrowDown)=\"change('hour', false); $event.preventDefault()\" (blur)=\"change('hour')\">\n          </mat-form-field>\n        </td>\n        <td class=\"ngx-mat-timepicker-spacer\">&#58;</td>\n        <td>\n          <mat-form-field appearance=\"fill\" [color]=\"color\">\n            <input type=\"text\" matInput (input)=\"formatInput($any($event).target)\" maxlength=\"2\"\n              formControlName=\"minute\" (keydown.ArrowUp)=\"change('minute', true); $event.preventDefault()\"\n              (keydown.ArrowDown)=\"change('minute', false); $event.preventDefault()\" (blur)=\"change('minute')\">\n          </mat-form-field>\n        </td>\n        <td *ngIf=\"showSeconds\" class=\"ngx-mat-timepicker-spacer\">&#58;</td>\n        <td *ngIf=\"showSeconds\">\n          <mat-form-field appearance=\"fill\" [color]=\"color\">\n            <input type=\"text\" matInput (input)=\"formatInput($any($event).target)\" maxlength=\"2\"\n              formControlName=\"second\" (keydown.ArrowUp)=\"change('second', true); $event.preventDefault()\"\n              (keydown.ArrowDown)=\"change('second', false); $event.preventDefault()\" (blur)=\"change('second')\">\n          </mat-form-field>\n        </td>\n\n        <td *ngIf=\"enableMeridian\" class=\"ngx-mat-timepicker-spacer\"></td>\n        <td *ngIf=\"enableMeridian\" class=\"ngx-mat-timepicker-meridian\">\n          <button mat-button (click)=\"toggleMeridian()\" mat-stroked-button [color]=\"color\" [disabled]=\"disabled\">\n            {{meridian}}\n          </button>\n        </td>\n      </tr>\n\n      <tr *ngIf=\"showSpinners\">\n        <td>\n          <button type=\"button\" mat-icon-button aria-label=\"expand_more icon\" (click)=\"change('hour', false)\"\n            [disabled]=\"disabled\">\n            <mat-icon>expand_more</mat-icon>\n          </button> </td>\n        <td></td>\n        <td>\n          <button type=\"button\" mat-icon-button aria-label=\"expand_more icon\" (click)=\"change('minute', false)\"\n            [disabled]=\"disabled || disableMinute\">\n            <mat-icon>expand_more</mat-icon>\n          </button> </td>\n        <td *ngIf=\"showSeconds\"></td>\n        <td *ngIf=\"showSeconds\">\n          <button type=\"button\" mat-icon-button aria-label=\"expand_more icon\" (click)=\"change('second', false)\"\n            [disabled]=\"disabled || disableMinute\">\n            <mat-icon>expand_more</mat-icon>\n          </button>\n        </td>\n        <td *ngIf=\"enableMeridian\" class=\"ngx-mat-timepicker-spacer\"></td>\n        <td *ngIf=\"enableMeridian\"></td>\n      </tr>\n    </tbody>\n  </table>\n</form>", styles: [".ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td{text-align:center;height:10px}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td.ngx-mat-timepicker-spacer{font-weight:700}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td.ngx-mat-timepicker-meridian .mdc-button{min-width:64px;line-height:36px;min-width:0;border-radius:50%;width:36px;height:36px;padding:0;flex-shrink:0}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-icon-button{height:24px;width:24px;line-height:24px;padding:0}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-icon-button .mat-icon{font-size:24px}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field{width:24px;max-width:24px;text-align:center}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field.mat-focused .mdc-text-field--filled .mat-mdc-form-field-focus-overlay,.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field:hover .mdc-text-field--filled .mat-mdc-form-field-focus-overlay{background-color:transparent}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field .mdc-text-field--filled{background-color:transparent!important;padding:0!important}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field .mdc-text-field--filled .mat-mdc-form-field-infix{padding:4px 0;min-height:1px!important}.ngx-mat-timepicker form .ngx-mat-timepicker-table .ngx-mat-timepicker-tbody tr td .mat-mdc-form-field .mdc-text-field--filled .mat-mdc-form-field-infix input{text-align:center;font-size:14px}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.NgxMatDateAdapter, decorators: [{
                    type: Optional
                }] }, { type: i0.ChangeDetectorRef }, { type: i2.FormBuilder }]; }, propDecorators: { disabled: [{
                type: Input
            }], showSpinners: [{
                type: Input
            }], stepHour: [{
                type: Input
            }], stepMinute: [{
                type: Input
            }], stepSecond: [{
                type: Input
            }], showSeconds: [{
                type: Input
            }], disableMinute: [{
                type: Input
            }], enableMeridian: [{
                type: Input
            }], defaultTime: [{
                type: Input
            }], color: [{
                type: Input
            }], modelChanged: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXBpY2tlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9kYXRldGltZS1waWNrZXIvc3JjL2xpYi90aW1lcGlja2VyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2RhdGV0aW1lLXBpY2tlci9zcmMvbGliL3RpbWVwaWNrZXIuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFxQixTQUFTLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQXFCLFFBQVEsRUFBRSxNQUFNLEVBQWlCLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JLLE9BQU8sRUFBZ0QsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFN0csT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRXpELE9BQU8sRUFDTCwwQkFBMEIsRUFBRSxZQUFZLEVBQUUsdUJBQXVCLEVBQ2pFLFdBQVcsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFFLG9CQUFvQixFQUN0RyxNQUFNLG9CQUFvQixDQUFDOzs7Ozs7Ozs7QUFtQjVCLE1BQU0sT0FBTyx5QkFBeUI7SUFpRHBDLFlBQStCLFlBQWtDLEVBQ3ZELEVBQXFCLEVBQVUsV0FBd0I7UUFEbEMsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBQ3ZELE9BQUUsR0FBRixFQUFFLENBQW1CO1FBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQWE7UUE5Q3hELGFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsaUJBQVksR0FBRyxJQUFJLENBQUM7UUFDcEIsYUFBUSxHQUFXLFlBQVksQ0FBQztRQUNoQyxlQUFVLEdBQVcsWUFBWSxDQUFDO1FB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QUFDLHlCQUF5QixFQUFDO1lBQ3hELEtBQUssRUFBRSxJQUFJO1NBQ1o7S0FDRiwrRUN4QkgsOC9IQW9GTzsyRkR4RE0seUJBQXlCO2tCQWpCckMsU0FBUzsrQkFDRSxvQkFBb0IsUUFHeEI7d0JBQ0osT0FBTyxFQUFFLG9CQUFvQjtxQkFDOUIsYUFDVTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUsaUJBQWlCOzRCQUMxQixXQUFXLEVBQUUsVUFBVSxFQUFDLEdBQUcsRUFBRSwwQkFBMEIsRUFBQzs0QkFDeEQsS0FBSyxFQUFFLElBQUk7eUJBQ1o7cUJBQ0YsWUFDUyxrQkFBa0IsaUJBQ2IsaUJBQWlCLENBQUMsSUFBSTs7MEJBbUR4QixRQUFRO3NHQTdDWixRQUFRO3NCQUFoQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFVBQVU7c0JBQWxCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLGNBQWM7c0JBQXRCLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBRUksWUFBWTtzQkFBckIsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnQsIEV2ZW50RW1pdHRlciwgZm9yd2FyZFJlZiwgSW5wdXQsIE9uQ2hhbmdlcywgT25Jbml0LCBPcHRpb25hbCwgT3V0cHV0LCBTaW1wbGVDaGFuZ2VzLCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIEZvcm1CdWlsZGVyLCBGb3JtR3JvdXAsIE5HX1ZBTFVFX0FDQ0VTU09SLCBWYWxpZGF0b3JzIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgVGhlbWVQYWxldHRlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvY29yZSc7XG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBkZWJvdW5jZVRpbWUsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IE5neE1hdERhdGVBZGFwdGVyIH0gZnJvbSAnLi9jb3JlL2RhdGUtYWRhcHRlcic7XG5pbXBvcnQge1xuICBjcmVhdGVNaXNzaW5nRGF0ZUltcGxFcnJvciwgREVGQVVMVF9TVEVQLCBmb3JtYXRUd29EaWdpdFRpbWVWYWx1ZSxcbiAgTElNSVRfVElNRVMsIE1FUklESUFOUywgTlVNRVJJQ19SRUdFWCwgUEFUVEVSTl9JTlBVVF9IT1VSLCBQQVRURVJOX0lOUFVUX01JTlVURSwgUEFUVEVSTl9JTlBVVF9TRUNPTkRcbn0gZnJvbSAnLi91dGlscy9kYXRlLXV0aWxzJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmd4LW1hdC10aW1lcGlja2VyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3RpbWVwaWNrZXIuY29tcG9uZW50Lmh0bWwnLFxuICBzdHlsZVVybHM6IFsnLi90aW1lcGlja2VyLmNvbXBvbmVudC5zY3NzJ10sXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbmd4LW1hdC10aW1lcGlja2VyJ1xuICB9LFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5neE1hdFRpbWVwaWNrZXJDb21wb25lbnQpLFxuICAgICAgbXVsdGk6IHRydWVcbiAgICB9XG4gIF0sXG4gIGV4cG9ydEFzOiAnbmd4TWF0VGltZXBpY2tlcicsXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXG59KVxuZXhwb3J0IGNsYXNzIE5neE1hdFRpbWVwaWNrZXJDb21wb25lbnQ8RD4gaW1wbGVtZW50cyBDb250cm9sVmFsdWVBY2Nlc3NvciwgT25Jbml0LCBPbkNoYW5nZXMge1xuXG4gIHB1YmxpYyBmb3JtOiBGb3JtR3JvdXA7XG5cbiAgQElucHV0KCkgZGlzYWJsZWQgPSBmYWxzZTtcbiAgQElucHV0KCkgc2hvd1NwaW5uZXJzID0gdHJ1ZTtcbiAgQElucHV0KCkgc3RlcEhvdXI6IG51bWJlciA9IERFRkFVTFRfU1RFUDtcbiAgQElucHV0KCkgc3RlcE1pbnV0ZTogbnVtYmVyID0gREVGQVVMVF9TVEVQO1xuICBASW5wdXQoKSBzdGVwU2Vjb25kOiBudW1iZXIgPSBERUZBVUxUX1NURVA7XG4gIEBJbnB1dCgpIHNob3dTZWNvbmRzID0gZmFsc2U7XG4gIEBJbnB1dCgpIGRpc2FibGVNaW51dGUgPSBmYWxzZTtcbiAgQElucHV0KCkgZW5hYmxlTWVyaWRpYW4gPSBmYWxzZTtcbiAgQElucHV0KCkgZGVmYXVsdFRpbWU6IG51bWJlcltdO1xuICBASW5wdXQoKSBjb2xvcjogVGhlbWVQYWxldHRlID0gJ3ByaW1hcnknO1xuXG4gIEBPdXRwdXQoKSBtb2RlbENoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyPEQ+KCk7XG5cbiAgcHVibGljIG1lcmlkaWFuOiBzdHJpbmcgPSBNRVJJRElBTlMuQU07XG5cbiAgLyoqIEhvdXIgKi9cbiAgcHJpdmF0ZSBnZXQgaG91cigpIHtcbiAgICBsZXQgdmFsID0gTnVtYmVyKHRoaXMuZm9ybS5jb250cm9sc1snaG91ciddLnZhbHVlKTtcbiAgICByZXR1cm4gaXNOYU4odmFsKSA/IDAgOiB2YWw7XG4gIH07XG5cbiAgcHJpdmF0ZSBnZXQgbWludXRlKCkge1xuICAgIGxldCB2YWwgPSBOdW1iZXIodGhpcy5mb3JtLmNvbnRyb2xzWydtaW51dGUnXS52YWx1ZSk7XG4gICAgcmV0dXJuIGlzTmFOKHZhbCkgPyAwIDogdmFsO1xuICB9O1xuXG4gIHByaXZhdGUgZ2V0IHNlY29uZCgpIHtcbiAgICBsZXQgdmFsID0gTnVtYmVyKHRoaXMuZm9ybS5jb250cm9sc1snc2Vjb25kJ10udmFsdWUpO1xuICAgIHJldHVybiBpc05hTih2YWwpID8gMCA6IHZhbDtcbiAgfTtcblxuICAvKiogV2hldGhlciBvciBub3QgdGhlIGZvcm0gaXMgdmFsaWQgKi9cbiAgcHVibGljIGdldCB2YWxpZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5mb3JtLnZhbGlkO1xuICB9XG5cbiAgcHJpdmF0ZSBfb25DaGFuZ2U6IGFueSA9ICgpID0+IHsgfTtcbiAgcHJpdmF0ZSBfb25Ub3VjaGVkOiBhbnkgPSAoKSA9PiB7IH07XG4gIHByaXZhdGUgX2Rpc2FibGVkOiBib29sZWFuO1xuICBwcml2YXRlIF9tb2RlbDogRDtcblxuICBwcml2YXRlIF9kZXN0cm95ZWQ6IFN1YmplY3Q8dm9pZD4gPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuXG4gIHB1YmxpYyBwYXR0ZXJuID0gUEFUVEVSTl9JTlBVVF9IT1VSO1xuXG4gIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIHB1YmxpYyBfZGF0ZUFkYXB0ZXI6IE5neE1hdERhdGVBZGFwdGVyPEQ+LFxuICAgIHByaXZhdGUgY2Q6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIGZvcm1CdWlsZGVyOiBGb3JtQnVpbGRlcikge1xuICAgIGlmICghdGhpcy5fZGF0ZUFkYXB0ZXIpIHtcbiAgICAgIHRocm93IGNyZWF0ZU1pc3NpbmdEYXRlSW1wbEVycm9yKCdOZ3hNYXREYXRlQWRhcHRlcicpO1xuICAgIH1cbiAgICB0aGlzLmZvcm0gPSB0aGlzLmZvcm1CdWlsZGVyLmdyb3VwKFxuICAgICAge1xuICAgICAgICBob3VyOiBbeyB2YWx1ZTogbnVsbCwgZGlzYWJsZWQ6IHRoaXMuZGlzYWJsZWQgfSwgW1ZhbGlkYXRvcnMucmVxdWlyZWQsIFZhbGlkYXRvcnMucGF0dGVybihQQVRURVJOX0lOUFVUX0hPVVIpXV0sXG4gICAgICAgIG1pbnV0ZTogW3sgdmFsdWU6IG51bGwsIGRpc2FibGVkOiB0aGlzLmRpc2FibGVkIH0sIFtWYWxpZGF0b3JzLnJlcXVpcmVkLCBWYWxpZGF0b3JzLnBhdHRlcm4oUEFUVEVSTl9JTlBVVF9NSU5VVEUpXV0sXG4gICAgICAgIHNlY29uZDogW3sgdmFsdWU6IG51bGwsIGRpc2FibGVkOiB0aGlzLmRpc2FibGVkIH0sIFtWYWxpZGF0b3JzLnJlcXVpcmVkLCBWYWxpZGF0b3JzLnBhdHRlcm4oUEFUVEVSTl9JTlBVVF9TRUNPTkQpXV1cbiAgICAgIH0pO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5mb3JtLnZhbHVlQ2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpLCBkZWJvdW5jZVRpbWUoNDAwKSkuc3Vic2NyaWJlKHZhbCA9PiB7XG4gICAgICB0aGlzLl91cGRhdGVNb2RlbCgpO1xuICAgIH0pXG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGNoYW5nZXMuZGlzYWJsZWQgfHwgY2hhbmdlcy5kaXNhYmxlTWludXRlKSB7XG4gICAgICB0aGlzLl9zZXREaXNhYmxlU3RhdGVzKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcbiAgICB0aGlzLl9kZXN0cm95ZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZXMgYSBuZXcgdmFsdWUgdG8gdGhlIGVsZW1lbnQuXG4gICAqIEBwYXJhbSBvYmpcbiAgICovXG4gIHdyaXRlVmFsdWUodmFsOiBEKTogdm9pZCB7XG4gICAgaWYgKHZhbCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9tb2RlbCA9IHZhbDtcbiAgICAgIHRoaXMuX3VwZGF0ZUhvdXJNaW51dGVTZWNvbmQoKTtcbiAgICB9XG5cbiAgfVxuXG4gIC8qKiBSZWdpc3RlcnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBjb250cm9sJ3MgdmFsdWUgY2hhbmdlcyBpbiB0aGUgVUkuICovXG4gIHJlZ2lzdGVyT25DaGFuZ2UoZm46IChfOiBhbnkpID0+IHt9KTogdm9pZCB7XG4gICAgdGhpcy5fb25DaGFuZ2UgPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoZSBjb250cm9sIHJlY2VpdmVzIGEgdG91Y2ggZXZlbnQuXG4gICAqL1xuICByZWdpc3Rlck9uVG91Y2hlZChmbjogKCkgPT4ge30pOiB2b2lkIHtcbiAgICB0aGlzLl9vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBhcHByb3ByaWF0ZSBET00gZWxlbWVudCAqL1xuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGlzRGlzYWJsZWQ7XG4gICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtYXQgaW5wdXRcbiAgICogQHBhcmFtIGlucHV0XG4gICAqL1xuICBwdWJsaWMgZm9ybWF0SW5wdXQoaW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICBpbnB1dC52YWx1ZSA9IGlucHV0LnZhbHVlLnJlcGxhY2UoTlVNRVJJQ19SRUdFWCwgJycpO1xuICB9XG5cbiAgLyoqIFRvZ2dsZSBtZXJpZGlhbiAqL1xuICBwdWJsaWMgdG9nZ2xlTWVyaWRpYW4oKSB7XG4gICAgdGhpcy5tZXJpZGlhbiA9ICh0aGlzLm1lcmlkaWFuID09PSBNRVJJRElBTlMuQU0pID8gTUVSSURJQU5TLlBNIDogTUVSSURJQU5TLkFNO1xuICAgIHRoaXMuY2hhbmdlKCdob3VyJyk7XG4gIH1cblxuICAvKiogQ2hhbmdlIHByb3BlcnR5IG9mIHRpbWUgKi9cbiAgcHVibGljIGNoYW5nZShwcm9wOiBzdHJpbmcsIHVwPzogYm9vbGVhbikge1xuICAgIGNvbnN0IG5leHQgPSB0aGlzLl9nZXROZXh0VmFsdWVCeVByb3AocHJvcCwgdXApO1xuICAgIHRoaXMuZm9ybS5jb250cm9sc1twcm9wXS5zZXRWYWx1ZShmb3JtYXRUd29EaWdpdFRpbWVWYWx1ZShuZXh0KSwgeyBvbmx5U2VsZjogZmFsc2UsIGVtaXRFdmVudDogZmFsc2UgfSk7XG4gICAgdGhpcy5fdXBkYXRlTW9kZWwoKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGUgY29udHJvbHMgb2YgZm9ybSBieSBtb2RlbCAqL1xuICBwcml2YXRlIF91cGRhdGVIb3VyTWludXRlU2Vjb25kKCkge1xuICAgIGxldCBfaG91ciA9IHRoaXMuX2RhdGVBZGFwdGVyLmdldEhvdXIodGhpcy5fbW9kZWwpO1xuICAgIGNvbnN0IF9taW51dGUgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRNaW51dGUodGhpcy5fbW9kZWwpO1xuICAgIGNvbnN0IF9zZWNvbmQgPSB0aGlzLl9kYXRlQWRhcHRlci5nZXRTZWNvbmQodGhpcy5fbW9kZWwpO1xuXG4gICAgaWYgKHRoaXMuZW5hYmxlTWVyaWRpYW4pIHtcbiAgICAgIGlmIChfaG91ciA+PSBMSU1JVF9USU1FUy5tZXJpZGlhbikge1xuICAgICAgICBfaG91ciA9IF9ob3VyIC0gTElNSVRfVElNRVMubWVyaWRpYW47XG4gICAgICAgIHRoaXMubWVyaWRpYW4gPSBNRVJJRElBTlMuUE07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm1lcmlkaWFuID0gTUVSSURJQU5TLkFNO1xuICAgICAgfVxuICAgICAgaWYgKF9ob3VyID09PSAwKSB7XG4gICAgICAgIF9ob3VyID0gTElNSVRfVElNRVMubWVyaWRpYW47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5mb3JtLnBhdGNoVmFsdWUoe1xuICAgICAgaG91cjogZm9ybWF0VHdvRGlnaXRUaW1lVmFsdWUoX2hvdXIpLFxuICAgICAgbWludXRlOiBmb3JtYXRUd29EaWdpdFRpbWVWYWx1ZShfbWludXRlKSxcbiAgICAgIHNlY29uZDogZm9ybWF0VHdvRGlnaXRUaW1lVmFsdWUoX3NlY29uZClcbiAgICB9LCB7XG4gICAgICBlbWl0RXZlbnQ6IGZhbHNlXG4gICAgfSlcblxuICB9XG5cbiAgLyoqIFVwZGF0ZSBtb2RlbCAqL1xuICBwcml2YXRlIF91cGRhdGVNb2RlbCgpIHtcbiAgICBsZXQgX2hvdXIgPSB0aGlzLmhvdXI7XG5cbiAgICBpZiAodGhpcy5lbmFibGVNZXJpZGlhbikge1xuICAgICAgaWYgKHRoaXMubWVyaWRpYW4gPT09IE1FUklESUFOUy5BTSAmJiBfaG91ciA9PT0gTElNSVRfVElNRVMubWVyaWRpYW4pIHtcbiAgICAgICAgX2hvdXIgPSAwO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm1lcmlkaWFuID09PSBNRVJJRElBTlMuUE0gJiYgX2hvdXIgIT09IExJTUlUX1RJTUVTLm1lcmlkaWFuKSB7XG4gICAgICAgIF9ob3VyID0gX2hvdXIgKyBMSU1JVF9USU1FUy5tZXJpZGlhbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbW9kZWwpIHtcbiAgICAgIGxldCBjbG9uZWRNb2RlbCA9IHRoaXMuX2RhdGVBZGFwdGVyLmNsb25lKHRoaXMuX21vZGVsKTtcbiAgICAgIGNsb25lZE1vZGVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuc2V0SG91cihjbG9uZWRNb2RlbCwgX2hvdXIpO1xuICAgICAgY2xvbmVkTW9kZWwgPSB0aGlzLl9kYXRlQWRhcHRlci5zZXRNaW51dGUoY2xvbmVkTW9kZWwsIHRoaXMubWludXRlKTtcbiAgICAgIGNsb25lZE1vZGVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuc2V0U2Vjb25kKGNsb25lZE1vZGVsLCB0aGlzLnNlY29uZCk7XG4gICAgICB0aGlzLl9vbkNoYW5nZShjbG9uZWRNb2RlbCk7XG4gICAgICBjb25zb2xlLmxvZyhcIkVtaXRpZW5kbzogXCIsIGNsb25lZE1vZGVsKVxuICAgICAgdGhpcy5tb2RlbENoYW5nZWQuZW1pdChjbG9uZWRNb2RlbCk7XG4gICAgfSBlbHNlIHtcblxuICAgICAgaWYgKCB0aGlzLmZvcm0uY29udHJvbHNbJ2hvdXInXS52YWx1ZSAmJiAgdGhpcy5mb3JtLmNvbnRyb2xzWydtaW51dGUnXS52YWx1ZSAmJiAgdGhpcy5mb3JtLmNvbnRyb2xzWydzZWNvbmQnXS52YWx1ZSkge1xuICAgICAgICBjb25zdCBkID0gdGhpcy5fZGF0ZUFkYXB0ZXIudG9kYXkoKVxuICAgICAgICBsZXQgY2xvbmVkTW9kZWwgPSB0aGlzLl9kYXRlQWRhcHRlci5jbG9uZShkKTtcbiAgICAgICAgY2xvbmVkTW9kZWwgPSB0aGlzLl9kYXRlQWRhcHRlci5zZXRIb3VyKGNsb25lZE1vZGVsLCBfaG91cik7XG4gICAgICAgIGNsb25lZE1vZGVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuc2V0TWludXRlKGNsb25lZE1vZGVsLCB0aGlzLm1pbnV0ZSk7XG4gICAgICAgIGNsb25lZE1vZGVsID0gdGhpcy5fZGF0ZUFkYXB0ZXIuc2V0U2Vjb25kKGNsb25lZE1vZGVsLCB0aGlzLnNlY29uZCk7XG4gICAgICAgIHRoaXMud3JpdGVWYWx1ZShjbG9uZWRNb2RlbCk7XG4gICAgICAgIHRoaXMuX29uQ2hhbmdlKGNsb25lZE1vZGVsKTtcbiAgICAgICAgdGhpcy5tb2RlbENoYW5nZWQuZW1pdChjbG9uZWRNb2RlbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBuZXh0IHZhbHVlIGJ5IHByb3BlcnR5XG4gICAqIEBwYXJhbSBwcm9wXG4gICAqIEBwYXJhbSB1cFxuICAgKi9cbiAgcHJpdmF0ZSBfZ2V0TmV4dFZhbHVlQnlQcm9wKHByb3A6IHN0cmluZywgdXA/OiBib29sZWFuKTogbnVtYmVyIHtcbiAgICBjb25zdCBrZXlQcm9wID0gcHJvcFswXS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zbGljZSgxKTtcbiAgICBjb25zdCBtaW4gPSBMSU1JVF9USU1FU1tgbWluJHtrZXlQcm9wfWBdO1xuICAgIGxldCBtYXggPSBMSU1JVF9USU1FU1tgbWF4JHtrZXlQcm9wfWBdO1xuXG4gICAgaWYgKHByb3AgPT09ICdob3VyJyAmJiB0aGlzLmVuYWJsZU1lcmlkaWFuKSB7XG4gICAgICBtYXggPSBMSU1JVF9USU1FUy5tZXJpZGlhbjtcbiAgICB9XG5cbiAgICBsZXQgbmV4dDtcbiAgICBpZiAodXAgPT0gbnVsbCkge1xuICAgICAgbmV4dCA9IHRoaXNbcHJvcF0gJSAobWF4KTtcbiAgICAgIGlmIChwcm9wID09PSAnaG91cicgJiYgdGhpcy5lbmFibGVNZXJpZGlhbikge1xuICAgICAgICBpZiAobmV4dCA9PT0gMCkgbmV4dCA9IG1heDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dCA9IHVwID8gdGhpc1twcm9wXSArIHRoaXNbYHN0ZXAke2tleVByb3B9YF0gOiB0aGlzW3Byb3BdIC0gdGhpc1tgc3RlcCR7a2V5UHJvcH1gXTtcbiAgICAgIGlmIChwcm9wID09PSAnaG91cicgJiYgdGhpcy5lbmFibGVNZXJpZGlhbikge1xuICAgICAgICBuZXh0ID0gbmV4dCAlIChtYXggKyAxKTtcbiAgICAgICAgaWYgKG5leHQgPT09IDApIG5leHQgPSB1cCA/IDEgOiBtYXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID0gbmV4dCAlIG1heDtcbiAgICAgIH1cbiAgICAgIGlmICh1cCkge1xuICAgICAgICBuZXh0ID0gbmV4dCA+IG1heCA/IChuZXh0IC0gbWF4ICsgbWluKSA6IG5leHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0ID0gbmV4dCA8IG1pbiA/IChuZXh0IC0gbWluICsgbWF4KSA6IG5leHQ7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZGlzYWJsZSBzdGF0ZXNcbiAgICovXG4gIHByaXZhdGUgX3NldERpc2FibGVTdGF0ZXMoKSB7XG4gICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuZm9ybS5kaXNhYmxlKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5mb3JtLmVuYWJsZSgpO1xuICAgICAgaWYgKHRoaXMuZGlzYWJsZU1pbnV0ZSkge1xuICAgICAgICB0aGlzLmZvcm0uZ2V0KCdtaW51dGUnKS5kaXNhYmxlKCk7XG4gICAgICAgIGlmICh0aGlzLnNob3dTZWNvbmRzKSB7XG4gICAgICAgICAgdGhpcy5mb3JtLmdldCgnc2Vjb25kJykuZGlzYWJsZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbn1cbiIsIjxmb3JtIFtmb3JtR3JvdXBdPVwiZm9ybVwiPlxuICA8dGFibGUgY2xhc3M9XCJuZ3gtbWF0LXRpbWVwaWNrZXItdGFibGVcIj5cbiAgICA8dGJvZHkgY2xhc3M9XCJuZ3gtbWF0LXRpbWVwaWNrZXItdGJvZHlcIj5cbiAgICAgIDx0ciAqbmdJZj1cInNob3dTcGlubmVyc1wiPlxuICAgICAgICA8dGQ+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgbWF0LWljb24tYnV0dG9uIGFyaWEtbGFiZWw9XCJleHBhbmRfbGVzcyBpY29uXCIgKGNsaWNrKT1cImNoYW5nZSgnaG91cicsIHRydWUpXCJcbiAgICAgICAgICAgIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiPlxuICAgICAgICAgICAgPG1hdC1pY29uPmV4cGFuZF9sZXNzPC9tYXQtaWNvbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC90ZD5cbiAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgIDx0ZD5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBtYXQtaWNvbi1idXR0b24gYXJpYS1sYWJlbD1cImV4cGFuZF9sZXNzIGljb25cIiAoY2xpY2spPVwiY2hhbmdlKCdtaW51dGUnLCB0cnVlKVwiXG4gICAgICAgICAgICBbZGlzYWJsZWRdPVwiZGlzYWJsZWQgfHwgZGlzYWJsZU1pbnV0ZVwiPlxuICAgICAgICAgICAgPG1hdC1pY29uPmV4cGFuZF9sZXNzPC9tYXQtaWNvbj5cbiAgICAgICAgICA8L2J1dHRvbj4gPC90ZD5cbiAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgIDx0ZCAqbmdJZj1cInNob3dTZWNvbmRzXCI+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgbWF0LWljb24tYnV0dG9uIGFyaWEtbGFiZWw9XCJleHBhbmRfbGVzcyBpY29uXCIgKGNsaWNrKT1cImNoYW5nZSgnc2Vjb25kJywgdHJ1ZSlcIlxuICAgICAgICAgICAgW2Rpc2FibGVkXT1cImRpc2FibGVkIHx8IGRpc2FibGVNaW51dGVcIj5cbiAgICAgICAgICAgIDxtYXQtaWNvbj5leHBhbmRfbGVzczwvbWF0LWljb24+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvdGQ+XG4gICAgICAgIDx0ZCAqbmdJZj1cImVuYWJsZU1lcmlkaWFuXCIgY2xhc3M9XCJuZ3gtbWF0LXRpbWVwaWNrZXItc3BhY2VyXCI+PC90ZD5cbiAgICAgICAgPHRkICpuZ0lmPVwiZW5hYmxlTWVyaWRpYW5cIj48L3RkPlxuICAgICAgPC90cj5cblxuICAgICAgPHRyPlxuICAgICAgICA8dGQ+XG4gICAgICAgICAgPG1hdC1mb3JtLWZpZWxkIGFwcGVhcmFuY2U9XCJmaWxsXCIgW2NvbG9yXT1cImNvbG9yXCI+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBtYXRJbnB1dCAoaW5wdXQpPVwiZm9ybWF0SW5wdXQoJGFueSgkZXZlbnQpLnRhcmdldClcIiBtYXhsZW5ndGg9XCIyXCIgZm9ybUNvbnRyb2xOYW1lPVwiaG91clwiXG4gICAgICAgICAgICAgIChrZXlkb3duLkFycm93VXApPVwiY2hhbmdlKCdob3VyJywgdHJ1ZSk7ICRldmVudC5wcmV2ZW50RGVmYXVsdCgpXCJcbiAgICAgICAgICAgICAgKGtleWRvd24uQXJyb3dEb3duKT1cImNoYW5nZSgnaG91cicsIGZhbHNlKTsgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcIiAoYmx1cik9XCJjaGFuZ2UoJ2hvdXInKVwiPlxuICAgICAgICAgIDwvbWF0LWZvcm0tZmllbGQ+XG4gICAgICAgIDwvdGQ+XG4gICAgICAgIDx0ZCBjbGFzcz1cIm5neC1tYXQtdGltZXBpY2tlci1zcGFjZXJcIj4mIzU4OzwvdGQ+XG4gICAgICAgIDx0ZD5cbiAgICAgICAgICA8bWF0LWZvcm0tZmllbGQgYXBwZWFyYW5jZT1cImZpbGxcIiBbY29sb3JdPVwiY29sb3JcIj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG1hdElucHV0IChpbnB1dCk9XCJmb3JtYXRJbnB1dCgkYW55KCRldmVudCkudGFyZ2V0KVwiIG1heGxlbmd0aD1cIjJcIlxuICAgICAgICAgICAgICBmb3JtQ29udHJvbE5hbWU9XCJtaW51dGVcIiAoa2V5ZG93bi5BcnJvd1VwKT1cImNoYW5nZSgnbWludXRlJywgdHJ1ZSk7ICRldmVudC5wcmV2ZW50RGVmYXVsdCgpXCJcbiAgICAgICAgICAgICAgKGtleWRvd24uQXJyb3dEb3duKT1cImNoYW5nZSgnbWludXRlJywgZmFsc2UpOyAkZXZlbnQucHJldmVudERlZmF1bHQoKVwiIChibHVyKT1cImNoYW5nZSgnbWludXRlJylcIj5cbiAgICAgICAgICA8L21hdC1mb3JtLWZpZWxkPlxuICAgICAgICA8L3RkPlxuICAgICAgICA8dGQgKm5nSWY9XCJzaG93U2Vjb25kc1wiIGNsYXNzPVwibmd4LW1hdC10aW1lcGlja2VyLXNwYWNlclwiPiYjNTg7PC90ZD5cbiAgICAgICAgPHRkICpuZ0lmPVwic2hvd1NlY29uZHNcIj5cbiAgICAgICAgICA8bWF0LWZvcm0tZmllbGQgYXBwZWFyYW5jZT1cImZpbGxcIiBbY29sb3JdPVwiY29sb3JcIj5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG1hdElucHV0IChpbnB1dCk9XCJmb3JtYXRJbnB1dCgkYW55KCRldmVudCkudGFyZ2V0KVwiIG1heGxlbmd0aD1cIjJcIlxuICAgICAgICAgICAgICBmb3JtQ29udHJvbE5hbWU9XCJzZWNvbmRcIiAoa2V5ZG93bi5BcnJvd1VwKT1cImNoYW5nZSgnc2Vjb25kJywgdHJ1ZSk7ICRldmVudC5wcmV2ZW50RGVmYXVsdCgpXCJcbiAgICAgICAgICAgICAgKGtleWRvd24uQXJyb3dEb3duKT1cImNoYW5nZSgnc2Vjb25kJywgZmFsc2UpOyAkZXZlbnQucHJldmVudERlZmF1bHQoKVwiIChibHVyKT1cImNoYW5nZSgnc2Vjb25kJylcIj5cbiAgICAgICAgICA8L21hdC1mb3JtLWZpZWxkPlxuICAgICAgICA8L3RkPlxuXG4gICAgICAgIDx0ZCAqbmdJZj1cImVuYWJsZU1lcmlkaWFuXCIgY2xhc3M9XCJuZ3gtbWF0LXRpbWVwaWNrZXItc3BhY2VyXCI+PC90ZD5cbiAgICAgICAgPHRkICpuZ0lmPVwiZW5hYmxlTWVyaWRpYW5cIiBjbGFzcz1cIm5neC1tYXQtdGltZXBpY2tlci1tZXJpZGlhblwiPlxuICAgICAgICAgIDxidXR0b24gbWF0LWJ1dHRvbiAoY2xpY2spPVwidG9nZ2xlTWVyaWRpYW4oKVwiIG1hdC1zdHJva2VkLWJ1dHRvbiBbY29sb3JdPVwiY29sb3JcIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIj5cbiAgICAgICAgICAgIHt7bWVyaWRpYW59fVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L3RkPlxuICAgICAgPC90cj5cblxuICAgICAgPHRyICpuZ0lmPVwic2hvd1NwaW5uZXJzXCI+XG4gICAgICAgIDx0ZD5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBtYXQtaWNvbi1idXR0b24gYXJpYS1sYWJlbD1cImV4cGFuZF9tb3JlIGljb25cIiAoY2xpY2spPVwiY2hhbmdlKCdob3VyJywgZmFsc2UpXCJcbiAgICAgICAgICAgIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiPlxuICAgICAgICAgICAgPG1hdC1pY29uPmV4cGFuZF9tb3JlPC9tYXQtaWNvbj5cbiAgICAgICAgICA8L2J1dHRvbj4gPC90ZD5cbiAgICAgICAgPHRkPjwvdGQ+XG4gICAgICAgIDx0ZD5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBtYXQtaWNvbi1idXR0b24gYXJpYS1sYWJlbD1cImV4cGFuZF9tb3JlIGljb25cIiAoY2xpY2spPVwiY2hhbmdlKCdtaW51dGUnLCBmYWxzZSlcIlxuICAgICAgICAgICAgW2Rpc2FibGVkXT1cImRpc2FibGVkIHx8IGRpc2FibGVNaW51dGVcIj5cbiAgICAgICAgICAgIDxtYXQtaWNvbj5leHBhbmRfbW9yZTwvbWF0LWljb24+XG4gICAgICAgICAgPC9idXR0b24+IDwvdGQ+XG4gICAgICAgIDx0ZCAqbmdJZj1cInNob3dTZWNvbmRzXCI+PC90ZD5cbiAgICAgICAgPHRkICpuZ0lmPVwic2hvd1NlY29uZHNcIj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBtYXQtaWNvbi1idXR0b24gYXJpYS1sYWJlbD1cImV4cGFuZF9tb3JlIGljb25cIiAoY2xpY2spPVwiY2hhbmdlKCdzZWNvbmQnLCBmYWxzZSlcIlxuICAgICAgICAgICAgW2Rpc2FibGVkXT1cImRpc2FibGVkIHx8IGRpc2FibGVNaW51dGVcIj5cbiAgICAgICAgICAgIDxtYXQtaWNvbj5leHBhbmRfbW9yZTwvbWF0LWljb24+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvdGQ+XG4gICAgICAgIDx0ZCAqbmdJZj1cImVuYWJsZU1lcmlkaWFuXCIgY2xhc3M9XCJuZ3gtbWF0LXRpbWVwaWNrZXItc3BhY2VyXCI+PC90ZD5cbiAgICAgICAgPHRkICpuZ0lmPVwiZW5hYmxlTWVyaWRpYW5cIj48L3RkPlxuICAgICAgPC90cj5cbiAgICA8L3Rib2R5PlxuICA8L3RhYmxlPlxuPC9mb3JtPiJdfQ==