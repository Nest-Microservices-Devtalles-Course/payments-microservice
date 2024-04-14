import {Injectable} from '@nestjs/common';
import Stripe from "stripe";
import {envs} from "../config";
import {PaymentSessionDto} from "./dto/payment-session.dto";
import {Request, response, Response} from "express";

@Injectable()
export class PaymentsService {

  private readonly stripe = new Stripe(envs.stripeSecretKey);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {

    const {currency, items, orderId} = paymentSessionDto;
    const lineItems = items.map(item => {
      return {
        price_data: {
          currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId,
        }
      },
      line_items: lineItems, /*: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: 20 * 100,
          },
          quantity: 2
        }
      ]*/
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });

    return session;
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = envs.stripeWebhookSecret;

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
    } catch (error) {
      console.log(error);
      response.status(400).send('Webhook error');
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        console.log("succeeded charge", chargeSucceeded);
        break;
      default:
        console.log("unhandled event");
    }

    return res.status(200).send({sig});
  }
}
