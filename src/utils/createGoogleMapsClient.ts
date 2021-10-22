import { Client } from '@googlemaps/google-maps-services-js';

let client: Client;

export function createGoogleMapsClient(): Client {
  if (client) return client;
  client = new Client({});

  return client;
}
