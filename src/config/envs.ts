import 'dotenv/config';

import * as joi from 'joi';
import * as process from "process";

interface envVars {
  PORT: number;
  STRIPE_SECRET_KEY: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
  STRIPE_WEBHOOK_SECRET: string;
  NATS_SERVERS: string[];
}

const envsSchema = joi.object({
  PORT: joi.number().required(),
  STRIPE_SECRET_KEY: joi.string().required(),
  STRIPE_SUCCESS_URL: joi.string().uri().required(),
  STRIPE_CANCEL_URL: joi.string().uri().required(),
  STRIPE_WEBHOOK_SECRET: joi.string().required(),
  NATS_SERVERS: joi.array().items(joi.string()).required(),
}).unknown(true);

const {error, value} = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) {
  throw new Error(`Config validation error ${error.message}`);
}

const envVars: envVars = value;

export const envs = {
  port: envVars.PORT,
  stripeSecretKey: envVars.STRIPE_SECRET_KEY,
  stripeSuccessUrl: envVars.STRIPE_SUCCESS_URL,
  stripeCancelUrl: envVars.STRIPE_CANCEL_URL,
  stripeWebhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
  natsServers: envVars.NATS_SERVERS,
}