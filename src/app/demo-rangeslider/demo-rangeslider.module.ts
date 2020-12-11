import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule, Routes } from '@angular/router';
import { NgxMatRangeSliderModule } from '../../../projects/range-slider/src/public-api';
import { SharedModule } from '../shared';
import { DemoRangeSliderComponent } from './demo-rangeslider.component';

const routes: Routes = [
  { path: '', component: DemoRangeSliderComponent }
]


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(
      routes,
    ),
    NgxMatRangeSliderModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    SharedModule
  ],
  declarations: [
    DemoRangeSliderComponent
  ]
})
export class DemoRangesliderModule { }
