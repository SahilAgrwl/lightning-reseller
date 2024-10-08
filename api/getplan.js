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

  // Handle GET request for proxy generation and plan info
  if (req.method === 'GET') {
    const { planId } = req.query;
    
    if (!planId) {
      return res.status(400).json({ error: 'Plan ID is required.' });
    }

    try {
      // Fetch proxy information
      const proxyResponse = await axios.get(
        `${EXTERNAL_API_URL}/plan/${IPV6_PLACEHOLDER}/read/${planId}`,
        {
          headers: {
            'x-api-key': API_KEY,
          },
        }
      );

      // Fetch plan information
      const infoResponse = await axios.get(
        `${EXTERNAL_API_URL}/info/${planId}`,
        {
          headers: {
            'x-api-key': API_KEY,
          },
        }
      );

      // Combine the responses
      const combinedResponse = {
        ...proxyResponse.data,
        planInfo: infoResponse.data
      };

      return res.status(200).json(combinedResponse);
    } catch (error) {
      console.error('Error fetching plan information:', error.message);
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  // Handle POST request for plan purchase, bandwidth modification, and whitelist IP management
  const { action, planId, bandwidth, ipAddress } = req.body;

  if (action === 'purchase') {

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
} else if (action === 'modifyBandwidth') {
  if (!planId) {
    return res.status(400).json({ error: 'Plan ID is required.' });
  }

  const additionalBandwidth = 5; // Default value of 5 GB

  try {
    const response = await axios.post(
      `${EXTERNAL_API_URL}/add/${planId}/${additionalBandwidth}`,
      {},
      {
        headers: {
          'x-api-key': API_KEY,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error modifying bandwidth:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
} else if (action === 'manageWhitelist') {
    if (!planId || !ipAddress) {
      return res.status(400).json({ error: 'Plan ID and IP address are required.' });
    }

    const whitelistAction = bandwidth === 'add' ? 'add' : 'remove';

    try {
      const response = await axios.post(
        `${EXTERNAL_API_URL}/plan/${IPV6_PLACEHOLDER}/${whitelistAction}/whitelist/${planId}/${ipAddress}`,
        {},
        {
          headers: {
            'x-api-key': API_KEY,
          },
        }
      );

      res.status(200).json(response.data);
    } catch (error) {
      console.error('Error managing whitelist:', error.message);
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ error: 'Internal server error.' });
      }
    }
  } else {
    res.status(400).json({ error: 'Invalid action.' });
  }
};