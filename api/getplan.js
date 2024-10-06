// api/getplan.js

const axios = require('axios');
const FormData = require('form-data');

// Load environment variables
const API_KEY = process.env.API_KEY;
const EXTERNAL_API_URL = 'https://resell.lightningproxies.net/api';
const IPV6_PLACEHOLDER = 'ipv6'; // Fixed path parameter

module.exports = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle GET request for proxy generation
  if (req.method === 'GET') {
    const { planId } = req.query;
    
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required.' });
    }

    try {
      const response = await axios.get(
        `${EXTERNAL_API_URL}/plan/${IPV6_PLACEHOLDER}/read/${planId}`,
        {
          headers: {
            'x-api-key': API_KEY,
          },
        }
      );

      return res.status(200).json(response.data);
    } catch (error) {
      console.error('Error generating proxies:', error.message);
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  // Handle POST request for plan purchase
  const { bandwidth } = req.body;

  // Input Validation
  if (bandwidth === undefined || bandwidth === null) {
    return res.status(400).json({ error: 'Bandwidth is required.' });
  }

  const bandwidthInt = parseInt(bandwidth, 10);
  if (isNaN(bandwidthInt) || bandwidthInt <= 0) {
    return res.status(400).json({ error: 'Bandwidth must be a positive integer.' });
  }

  try {
    // Prepare form data
    const form = new FormData();
    form.append('bandwidth', bandwidthInt);

    // Make POST request to external API with fixed 'ipv6' path parameter
    const response = await axios.post(
      `${EXTERNAL_API_URL}/getplan/${encodeURIComponent(IPV6_PLACEHOLDER)}`,
      form,
      {
        headers: {
          'x-api-key': API_KEY,
          ...form.getHeaders(),
        },
      }
    );

    // Send back the response from external API
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling external API:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};