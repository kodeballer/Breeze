import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { ApiService } from '../../shared/services/api.service';
import { GlobalService } from '../../shared/services/global.service';
import { WalletInfo } from '../../shared/classes/wallet-info';

import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'tumblebit-component',
  templateUrl: './tumblebit.component.html',
  styleUrls: ['./tumblebit.component.css']
})

export class TumblebitComponent implements OnInit {
  constructor(private apiService: ApiService, private globalService: GlobalService, private modalService: NgbModal, private fb: FormBuilder) {
    this.buildTumbleBitForm();
  }

  private confirmedBalance: number;
  private walletBalanceSubscription: Subscription;

  private tumblebitForm: FormGroup;

  private buildTumbleBitForm(): void {
    this.tumblebitForm = this.fb.group({
      'destination': ['', Validators.required],
    })

    this.tumblebitForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    
    this.onValueChanged();
  }

  // TODO: abstract to a shared utility lib
  onValueChanged(data?: any) {
    console.log('changed')
    if (!this.tumblebitForm) { return; }
    const form = this.tumblebitForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        console.log(control)
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  formErrors = {
    'destination': '',
  };

  validationMessages = {
    'destination': {
      'required': 'A destination is required.'
    }
  }

  private tumble() {
    console.log(this.tumblebitForm);
  }

  ngOnInit() {
    this.getWalletBalance();
  };

  ngOnDestroy() {
    this.walletBalanceSubscription.unsubscribe();
  };

  private getWalletBalance() {
    let walletInfo = new WalletInfo(this.globalService.getWalletName(), this.globalService.getCoinType())
    this.walletBalanceSubscription = this.apiService.getWalletBalance(walletInfo)
      .subscribe(
        response =>  {
          if (response.status >= 200 && response.status < 400) {
              let balanceResponse = response.json();
              this.confirmedBalance = balanceResponse.balances[0].amountConfirmed;
          }
        },
        error => {
          console.log(error);
          if (error.status === 0) {
            alert("Something went wrong while connecting to the API. Please restart the application.");
          } else if (error.status >= 400) {
            if (!error.json().errors[0]) {
              console.log(error);
            }
            else {
              alert(error.json().errors[0].description);
            }
          }
        }
      )
    ;
  };

}
