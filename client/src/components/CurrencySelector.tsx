import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';

interface SiteSettingsResponse {
  success: boolean;
  data: {
    id: number;
    siteName: string;
    logoColor: string;
    accentColor: string;
    logoText: string;
    customLogo: string | null;
    updatedAt: string;
    defaultCurrency?: string;
  };
}

const currencies = [
  { label: 'USD ($)', value: 'USD', symbol: '$' },
  { label: 'EUR (€)', value: 'EUR', symbol: '€' },
  { label: 'MAD (د.م.)', value: 'MAD', symbol: 'د.م.' },
];

// Exchange rates relative to USD (1 USD = x currency)
const exchangeRates = {
  USD: 1,
  EUR: 0.92, // 1 USD = 0.92 EUR
  MAD: 10.01, // 1 USD = 10.01 MAD
};

interface CurrencySelectorProps {
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  // Get site settings to potentially load default currency
  const { data: siteSettingsResponse } = useQuery<SiteSettingsResponse>({
    queryKey: ['/api/settings'],
    enabled: false, // We'll manually enable this when needed
  });

  useEffect(() => {
    // Check for saved currency in localStorage
    const savedCurrency = localStorage.getItem('ether_currency');
    
    if (savedCurrency && currencies.some(c => c.value === savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    } else if (siteSettingsResponse && siteSettingsResponse.data?.defaultCurrency) {
      // Fallback to site settings default if available
      setSelectedCurrency(siteSettingsResponse.data.defaultCurrency);
    }
  }, [siteSettingsResponse]);

  const handleSelectCurrency = (currency: string) => {
    setSelectedCurrency(currency);
    localStorage.setItem('ether_currency', currency);
    setOpen(false);
    
    // Dispatch an event to notify other components about the currency change
    const event = new CustomEvent('currencyChange', { 
      detail: { 
        currency,
        rate: exchangeRates[currency as keyof typeof exchangeRates] 
      } 
    });
    window.dispatchEvent(event);
  };

  const selectedLabel = currencies.find(c => c.value === selectedCurrency)?.label || 'USD ($)';
  const selectedSymbol = currencies.find(c => c.value === selectedCurrency)?.symbol || '$';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-36 justify-between", className)}
        >
          <Coins className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{selectedLabel}</span>
          <span className="sm:hidden">{selectedSymbol}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          <CommandGroup>
            {currencies.map((currency) => (
              <CommandItem
                key={currency.value}
                value={currency.value}
                onSelect={() => handleSelectCurrency(currency.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedCurrency === currency.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {currency.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Export a helper function to format prices according to currency
export const formatPrice = (price: string | number, currency: string = 'USD'): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return '0';
  
  // Convert price to selected currency
  const rate = exchangeRates[currency as keyof typeof exchangeRates] || 1;
  const convertedPrice = numericPrice * rate;
  
  // Format according to currency
  switch (currency) {
    case 'USD':
      return `$${convertedPrice.toFixed(2)}`;
    case 'EUR':
      return `€${convertedPrice.toFixed(2)}`;
    case 'MAD':
      return `${convertedPrice.toFixed(2)} د.م.`;
    default:
      return `${convertedPrice.toFixed(2)}`;
  }
};

export default CurrencySelector;