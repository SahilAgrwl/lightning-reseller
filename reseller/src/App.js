import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Network, LayoutDashboard, ShoppingCart, CheckCircle, Globe, Lock, Zap, RotateCw, Copy, CheckCheck, Plus, Minus, Calendar, Clock, Database, Settings, User, Shield } from 'lucide-react';
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
  const [newIpAddress, setNewIpAddress] = useState('');
  const [additionalBandwidth, setAdditionalBandwidth] = useState('');
  const [portType, setPortType] = useState('http');
  const [sessionTimeUnit, setSessionTimeUnit] = useState('sec');
  const [sessionTimeValue, setSessionTimeValue] = useState('1');
  const [addHttpPrefix, setAddHttpPrefix] = useState(false);
  const [proxyFormatType, setProxyFormatType] = useState('hostname:port:username:password');
  const [stickyCount, setStickyCount] = useState(5);
  const [showProxyInfo, setShowProxyInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('userAuth');


  
  const generateProxy = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/getplan?planId=${activePlan.planID}`);
      setProxyInfo(response.data);
      const countries = Object.keys(response.data.whitelist_proxies);
      if (countries.length > 0) {
        setSelectedCountry(countries[0]);
      }
      setShowProxyInfo(true);
      toast.success('Proxies generated successfully!');
    } catch (error) {
      console.error('Error generating proxies:', error);
      toast.error('Failed to generate proxies');
    } finally {
      setIsLoading(false);
    }
  };

  const addBandwidth = async () => {
    try {
      const response = await axios.post('/api/getplan', {
        action: 'modifyBandwidth',
        planId: activePlan.planID
      });
      toast.success('Bandwidth added successfully!');
      generateProxy(); // Refresh proxy info after adding bandwidth
    } catch (error) {
      console.error('Error adding bandwidth:', error);
      toast.error('Failed to add bandwidth');
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
   
  const getPort = () => portType === 'http' ? '1001' : '999';
  
  const getSessionTime = () => {
    const value = parseInt(sessionTimeValue, 10);
    switch (sessionTimeUnit) {
      case 'min': return value * 60;
      case 'hour': return value * 3600;
      default: return value;
    }
  };

  const generateRandomAlphabets = () => {
    const chars = '4929hfhbh4899HDVSBHhsdfgvk';
    return Array.from({length: 10}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

 
  const getProxyFormat = () => {
    const sessionTime = getSessionTime();
    const randomAlphabets = generateRandomAlphabets();
    const baseFormat = `${proxyInfo?.proxies?.username}-session-${randomAlphabets}-time-${sessionTime}-package-ipv6:${proxyInfo?.proxies?.password}`;
    
    if (proxyFormatType === 'username:password@hostname:port') {
      return `${baseFormat}@ipv6.lightningproxies.net:${getPort()}`;
    } else {
      return `ipv6.lightningproxies.net:${getPort()}:${baseFormat}`;
    }
  };

  const getFormattedProxy = (proxy) => {
    return addHttpPrefix ? `http://${proxy}` : proxy;
  };


  const manageWhitelist = async (action, ip = '') => {
    try {
      const response = await axios.post('/api/getplan', {
        action: 'manageWhitelist',
        planId: activePlan.planID,
        bandwidth: action,
        ipAddress: ip || newIpAddress
      });
      toast.success(`IP ${action === 'add' ? 'added to' : 'removed from'} whitelist`);
      generateProxy();
      setNewIpAddress('');
    } catch (error) {
      console.error('Error managing whitelist:', error);
      toast.error(`Failed to ${action} IP to whitelist`);
    }
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center">
        <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
        Your Active Plan
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-blue-600">IPv6 Bandwidth {activePlan.bandwidth}GB</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">Plan ID: {activePlan.planID}</p>
          </CardContent>
        </Card>
       
       {proxyInfo && proxyInfo.planInfo && (
        <>
        <Card >
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Calendar className="h-6 w-6 mr-2" />
              Expiration Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {proxyInfo?.planInfo?.expiration_date
                ? new Date(proxyInfo.planInfo.expiration_date).toLocaleString()
                : 'N/A'}
            </p>
            <p className="mt-2 flex items-center text-grey-200">
              <Clock className="h-5 w-5 mr-2" />
              Time Left: {proxyInfo?.planInfo?.time_left || 'N/A'}
            </p>
          </CardContent>
        </Card>
        </>
  )}
      </div>

      
      <Button 
        onClick={generateProxy} 
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition duration-300"
      >
        {isLoading ? (
          <RotateCw className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Zap className="h-5 w-5 mr-2" />
        )}
        {isLoading ? 'Generating...' : 'Generate Proxy'}
      </Button>
  
      {showProxyInfo && proxyInfo.planInfo && (
        <>
      <Card className="mb-6 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-6 w-6 mr-2 text-blue-500" />
            Bandwidth Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span>Used: {proxyInfo?.proxies?.bandwidth - proxyInfo?.proxies?.bandwidthLeft || 0}GB</span>
            <span>Remaining: {proxyInfo?.proxies?.bandwidthLeft || 0}GB</span>
          </div>
          <div className="w-full bg-blue-600 rounded-full h-2.5">
            <div 
              className="bg-grey-200 h-2.5 rounded-full" 
              style={{width: `${((proxyInfo?.proxies?.bandwidth - proxyInfo?.proxies?.bandwidthLeft) / proxyInfo?.proxies?.bandwidth) * 100 || 0}%`}}
            ></div>
          </div>
          <div className="mt-4 flex items-center">
            <Button onClick={addBandwidth} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Bandwidth
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-6 w-6 mr-2 text-purple-500" />
            Configure Proxy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <Button 
              onClick={() => setActiveTab('userAuth')} 
              className={`mr-2 ${activeTab === 'userAuth' ? 'bg-blue-600' : 'bg-gray-200 text-gray-800'}`}
            >
              <User className="h-4 w-4 mr-2" />
              User Auth & Pass
            </Button>
            <Button 
              onClick={() => setActiveTab('whitelistIp')} 
              className={activeTab === 'whitelistIp' ? 'bg-blue-600' : 'bg-gray-200 text-gray-800'}
            >
              <Shield className="h-4 w-4 mr-2" />
              Whitelist IP
            </Button>
          </div>

          {activeTab === 'userAuth' && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Username</p>
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                    <p className="font-mono text-sm flex-1 truncate">{proxyInfo?.proxies?.username}-package-ipv6</p>
                    <button
                      onClick={() => copyToClipboard(proxyInfo?.proxies?.username)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {copiedProxy === proxyInfo?.proxies?.username ? (
                        <CheckCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Password</p>
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                    <p className="font-mono text-sm flex-1 truncate">{proxyInfo?.proxies?.password}</p>
                    <button
                      onClick={() => copyToClipboard(proxyInfo?.proxies?.password)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {copiedProxy === proxyInfo?.proxies?.password ? (
                        <CheckCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Proxy Generation Information */}
              <div className="max-w-4xl mx-auto p-6 bg-white text-gray-800">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Proxy Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Host</h3>
            <p className="font-mono bg-gray-100 p-2 rounded">ipv6.lightningproxies.net</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Port (HTTP & SOCKS5)</h3>
            <div className="flex gap-2">
              <Button
                onClick={() => setPortType('http')}
                variant={portType === 'http' ? 'default' : 'outline'}
              >
                HTTP (1001)
              </Button>
              <Button
                onClick={() => setPortType('socks5')}
                variant={portType === 'socks5' ? 'default' : 'outline'}
              >
                SOCKS5 (999)
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Rotating Proxy</h3>
            <p className="font-mono bg-gray-100 p-2 rounded break-all">
              ipv6.lightningproxies.net:{getPort()}:{proxyInfo?.proxies?.username}-package-ipv6:{proxyInfo?.proxies?.password}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sticky Sessions</h3>
            <div className="flex gap-2 items-center">
              <Select value={sessionTimeUnit} onValueChange={setSessionTimeUnit}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sec">Seconds</SelectItem>
                  <SelectItem value="min">Minutes</SelectItem>
                  <SelectItem value="hour">Hours</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="number"
                value={sessionTimeValue}
                onChange={(e) => setSessionTimeValue(e.target.value)}
                className="p-2 border rounded w-20"
                min="1"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">Session time: {getSessionTime()} sec</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">Proxy Format Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
            <input
                type="checkbox"
                id="httpPrefix"
                checked={addHttpPrefix}
                onChange={(e) => setAddHttpPrefix(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="httpPrefix" className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Add format [ http:// ]
              </label>
            </div>
            <Select value={proxyFormatType} onValueChange={setProxyFormatType}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select proxy format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hostname:port:username:password">hostname : port : username : password</SelectItem>
                <SelectItem value="username:password@hostname:port">username : password @ hostname : port</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label htmlFor="stickyCount" className="text-sm font-medium text-gray-700">Sticky Count:</label>
            <input
              id="stickyCount"
              type="number"
              value={stickyCount}
              onChange={(e) => setStickyCount(Math.max(0, parseInt(e.target.value, 10)))}
              className="p-2 border rounded w-20"
              min="0"
            />
          </div>
          
          {stickyCount > 0 && (
            <ul className="space-y-2 bg-gray-50 p-4 rounded-lg">
              {[...Array(stickyCount)].map((_, index) => (
                <li key={index} className="font-mono text-sm break-all bg-white p-2 rounded shadow">
                  {getFormattedProxy(getProxyFormat())}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
            </div>
          )}

          {activeTab === 'whitelistIp' && (
            <div>
              {/* Whitelist IP Management section */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Whitelist IP Management</h3>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                    placeholder="Enter IP address"
                    className="flex-1 p-2 border rounded"
                  />
                  <Button onClick={() => manageWhitelist('add')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add IP
                  </Button>
                </div>
                <div className="space-y-2">
                  {proxyInfo?.planInfo?.whitelist.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <code className="font-mono text-sm">{ip}</code>
                      <button
                        onClick={() => manageWhitelist('remove', ip)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Minus className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Country selection and Proxy Lists section */}
              <div>
                <h3 className="font-semibold mb-3">Proxy</h3>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full mb-4 p-2 rounded border bg-white"
                >
                  <option value="">Select a country</option>
                  {Object.keys(proxyInfo?.whitelist_proxies || {}).map((country) => (
                    <option key={country} value={country}>
                      {country.toUpperCase()}
                    </option>
                  ))}
                </select>
                
                {selectedCountry && (
                  <div className="space-y-2">
                    {proxyInfo?.whitelist_proxies[selectedCountry].map((proxy, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                        <code className="font-mono text-sm flex-1 truncate">{proxy}</code>
                        <button
                          onClick={() => copyToClipboard(proxy)}
                          className="p-1 hover:bg-gray-200 rounded ml-2"
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
          )}
        </CardContent>
      </Card>
      </>
      ) }


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
        action: 'purchase',
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