'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTrip } from '@/app/trips/actions';
import { CURRENCIES } from '@/lib/currencies';
import { useTranslations } from '@/components/i18n-provider';

export function CreateTripDialog() {
  const dict = useTranslations();

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>{dict.dashboard.newTrip}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dict.createTrip.title}</DialogTitle>
          <DialogDescription>{dict.createTrip.description}</DialogDescription>
        </DialogHeader>
        <form action={createTrip} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{dict.createTrip.nameLabel}</Label>
            <Input
              id="name"
              name="name"
              required
              autoFocus
              placeholder={dict.createTrip.namePlaceholder}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="currency">{dict.createTrip.currencyLabel}</Label>
              <Select name="currency" defaultValue="USD">
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} — {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="settleCurrency">
                {dict.createTrip.settleCurrencyLabel}
              </Label>
              <Select name="settleCurrency" defaultValue="USD">
                <SelectTrigger id="settleCurrency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} — {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{dict.createTrip.submit}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
