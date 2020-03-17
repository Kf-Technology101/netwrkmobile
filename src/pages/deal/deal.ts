import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

// declare var Stripe;

@Component({
  selector: 'page-deal',
  templateUrl: 'deal.html',
})
export class DealPage {
// stripe = Stripe('pk_test_qM3f3duLZmjcwalOxkTC64oF00aa7NCo3b');
// card: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() {
	// this.setupStripe();
    console.log('ionViewDidLoad DealPage');
  }

  /* public setupStripe(){
    let elements = this.stripe.elements();
    var style = {
      base: {
        color: '#32325d',
        lineHeight: '24px',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    this.card = elements.create('card', { style: style });

    this.card.mount('#card-element');

    this.card.addEventListener('change', event => {
      var displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    var form = document.getElementById('payment-form');
    form.addEventListener('submit', event => {
      event.preventDefault();
	  console.log(this.card);
      this.stripe.createToken(this.card).then(result => {
        if (result.error) {
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
		  console.log("<<===================Stripe Result : createToken===============>>");
          console.log(result);
        }
      });    
	  
      /* this.stripe.createSource(this.card).then(result => {
        if (result.error) {
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = result.error.message;
        } else {
		  console.log("<<===================Stripe Result : createSource===============>>");
          console.log(result);
        }
      }); */
    /*});
  } */
  
  
}
