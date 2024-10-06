import React, { useState } from 'react';
import axios from 'axios';
import { Network, LayoutDashboard, ShoppingCart, CheckCircle, Globe, Lock, Zap, RotateCw, Copy, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Sidebar = ({ activePage, setActivePage }) => {
  return (
    <div className="lg:w-64 bg-gray-900 text-white p-6 flex-shrink-0">
      <div className="flex items-center gap-2 mb-8">
        <Network className="h-8 w-8 text-blue-400" />
        <h1 className="text-xl font-bold">Lightning Proxies</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'purchasePlan', icon: ShoppingCart, label: 'Purchase Plan' },
          ].map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

const PlanCard = ({ bandwidth, price, onPurchase }) => {
  const features = [
    { icon: Globe, text: '/29 Network IP Pool size' },
    { icon: Lock, text: 'IP & User:Pass Authentication' },
    { icon: Globe, text: 'Country Targeting' },
    { icon: RotateCw, text: 'Rotating & Sticky Sessions' },
    { icon: Zap, text: 'HTTP Protocol Supported' },
  ];

  return (
    <Card className="w-full max-w-sm transition-transform hover:scale-105">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">IPv6 {bandwidth}GB</CardTitle>
        <CardDescription className="text-3xl font-bold text-blue-600">${price}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <feature.icon className="h-5 w-5 text-blue-500" />
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
          onClick={() => onPurchase(bandwidth)}
        >
          Purchase Plan
        </Button>
      </CardFooter>
    </Card>
  );
};


const Dashboard = ({ activePlan }) => {
  const [proxyInfo, setProxyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [copiedProxy, setCopiedProxy] = useState('');
  

  const generateProxy = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/getplan?planId=${activePlan.planID}`);
      setProxyInfo(response.data);
      // Set the first country as default selected
      const countries = Object.keys(response.data.whitelist_proxies);
      if (countries.length > 0) {
        setSelectedCountry(countries[0]);
      }
      toast.success('Proxies generated successfully!');
    } catch (error) {
      console.error('Error generating proxies:', error);
      toast.error('Failed to generate proxies');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (proxy) => {
    navigator.clipboard.writeText(proxy).then(() => {
      setCopiedProxy(proxy);
      setTimeout(() => setCopiedProxy(''), 2000);
      toast.success('Proxy copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy proxy');
    });
  };

  if (!activePlan) {
    return (
      <div className="text-center p-8">
        <LayoutDashboard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">No Active Plans</h2>
        <p className="text-gray-500 mt-2">Purchase a plan to get started</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Your Active Plan</h2>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            IPv6 Bandwidth {activePlan.bandwidth}GB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Plan ID</p>
              <p className="font-mono">{activePlan.planID}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Usage</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full w-full"></div>
              </div>
              <p className="text-sm mt-1">
                {activePlan.bandwidth}GB / {activePlan.bandwidth}GB
              </p>
            </div>
            <Button 
              onClick={generateProxy} 
              disabled={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? 'Generating...' : 'Generate Proxy'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      
      {proxyInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Proxy Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Authentication section remains the same */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Authentication</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Username</p>
                    <div className="flex items-center gap-2 bg-white p-2 rounded">
                      <p className="font-mono text-sm flex-1 truncate">{proxyInfo.proxies.username}</p>
                      <button
                        onClick={() => copyToClipboard(proxyInfo.proxies.username)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {copiedProxy === proxyInfo.proxies.username ? (
                          <CheckCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Password</p>
                    <div className="flex items-center gap-2 bg-white p-2 rounded">
                      <p className="font-mono text-sm flex-1 truncate">{proxyInfo.proxies.password}</p>
                      <button
                        onClick={() => copyToClipboard(proxyInfo.proxies.password)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {copiedProxy === proxyInfo.proxies.password ? (
                          <CheckCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Updated Proxy Lists section with simple dropdown */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Proxy Lists</h3>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full mb-4 p-2 rounded border bg-white"
                >
                  <option value="">Select a country</option>
                  {Object.keys(proxyInfo.whitelist_proxies).map((country) => (
                    <option key={country} value={country}>
                      {country.toUpperCase()}
                    </option>
                  ))}
                </select>
                
                {selectedCountry && (
                  <div className="space-y-2">
                    {proxyInfo.whitelist_proxies[selectedCountry].map((proxy, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                        <code className="font-mono text-sm flex-1 truncate">{proxy}</code>
                        <button
                          onClick={() => copyToClipboard(proxy)}
                          className="p-1 hover:bg-gray-100 rounded ml-2"
                        >
                          {copiedProxy === proxy ? (
                            <CheckCheck className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [activePlan, setActivePlan] = useState(null);
  const [error, setError] = useState(null);

  const handlePurchase = async (bandwidth) => {
    setError(null);
    try {
      const response = await axios.post('/api/getplan', {
        bandwidth: parseInt(bandwidth, 10)
      });

      const planID = response.data.PlanID;
      setActivePlan({ bandwidth, planID });
      toast.success('Plan purchased successfully!');
      setActivePage('dashboard');
    } catch (err) {
      console.error('Error purchasing plan:', err);
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(`Failed to purchase plan: ${errorMessage}`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-6">
        {activePage === 'dashboard' && <Dashboard activePlan={activePlan} />}
        {activePage === 'purchasePlan' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Purchase Plan</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <PlanCard bandwidth={5} price={0.50} onPurchase={handlePurchase} />
              <PlanCard bandwidth={100} price={1.00} onPurchase={handlePurchase} />
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </main>
      <ToastContainer position="bottom-right" />
    </div>
  );
}