import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Chrome, 
  Apple, 
  Facebook,
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AuthModal = ({ isOpen, onClose, isTransparent }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const countries = [
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
  ];

  const socialButtons = [
    { icon: Chrome, label: 'Continue with Google', provider: 'google' },
    { icon: Apple, label: 'Continue with Apple', provider: 'apple' },
    { icon: Mail, label: 'Continue with email', provider: 'email' },
    { icon: Facebook, label: 'Continue with Facebook', provider: 'facebook' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-142 p-0 gap-0 bg-white overflow-hidden rounded-xl border-none">
        {/* Header */}
        <DialogHeader className={`p-4 border-b flex flex-row items-center justify-center relative ${isTransparent ? "bg-transparent" : "bg-white"}`}>
          <button
            onClick={onClose}
            className="absolute left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <DialogTitle className="text-base font-bold">
            Log in or sign up
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-6">Welcome to Airbnb</h2>

          {/* Form Section */}
          <div className="space-y-0 rounded-xl border border-gray-400 overflow-hidden">
            <Select 
              defaultValue="+91"
              onValueChange={(value) => setCountryCode(value)}
            >
              <SelectTrigger className="w-full h-14 px-4 border-none focus:ring-0 rounded-none border-b">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Country/Region</span>
                  <SelectValue placeholder="Country/Region" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.name} value={country.code}>
                    {country.flag} {country.name} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="tel"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full h-14 px-4 border-none focus-visible:ring-0 text-base rounded-none"
            />
          </div>

          <p className="text-[12px] text-gray-600 mt-2 leading-tight">
            We’ll call or text you to confirm your number. Standard message and data rates apply. 
            <span className="font-semibold underline ml-1 cursor-pointer">Privacy Policy</span>
          </p>

          <Button
            onClick={() => console.log(countryCode + phoneNumber)}
            className="w-full h-12 mt-4 bg-[#E01561] hover:bg-[#D70466] text-white font-semibold rounded-lg"
            disabled={!phoneNumber}
          >
            Continue
          </Button>

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs">
                <span className={`${isTransparent ? "bg-transparent" : "bg-white"} px-4 text-gray-500`}>or</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-4">
            {socialButtons.map((button) => (
              <Button
                key={button.label}
                variant="outline"
                className="w-full h-12 justify-between px-6 border-gray-900 hover:bg-gray-50 rounded-lg text-sm font-semibold"
              >
                <button.icon className="h-5 w-5" />
                <span className="flex-1 text-center">{button.label}</span>
                <div className="w-5" />
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;