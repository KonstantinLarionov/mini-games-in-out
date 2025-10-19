import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Profile {
  id: string;
  telegram: string;
  balance: number;
  wallet?: string;
}

interface Transaction {
  hash: string;
  id: string;
  type: string;
  amount: number;
  currency: string;
  createAt: string;
  wallet: string;
}

@Component({
  selector: 'app-neon-games',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './balance.page.component.html',
  styleUrls: ['./balance.page.component.css']
})
export class BalancePageComponent implements OnInit {
  profile?: Profile;
  transactions: Transaction[] = [];
  tab: 'main' | 'payin' | 'payout' | 'history' = 'main';

  readonly network = 'TRC20 (USDT)';
  readonly trcWallet = 'TVgGybqBzS6pGfMhoQ3SRxGXmXxv91nqfP';
  readonly qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('USDT TRC20: TVgGybqBzS6pGfMhoQ3SRxGXmXxv91nqfP')}`;

  baseUrl = 'https://api.reloapp.ru/api';
  telegramId = '';

  // формы
  payAmount = 0;
  hashTx = '';
  isConfirmMode = false; // режим ввода хэша

  payoutAmount = 0;
  payoutWallet = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.telegramId = localStorage.getItem('telegramId') || '';
    if (this.telegramId) this.loadProfile();
  }

  loadProfile() {
    this.http.get<Profile>(`${this.baseUrl}/profile/balance/${this.telegramId}`)
      .subscribe(p => {
        this.profile = p;
        this.loadTransactions(p.id);
      });
  }

  loadTransactions(profileId: string) {
    this.http.get<Transaction[]>(`${this.baseUrl}/transactions/${profileId}`)
      .subscribe(t => this.transactions = t);
  }

  openConfirmMode() {
    this.isConfirmMode = true;
  }

  confirmPayIn() {
    if (!this.profile || this.payAmount <= 0 || !this.hashTx) return;
    const body = {
      profileId: this.profile.id,
      amount: this.payAmount,
      currency: 'USDT',
      network: 'TRC20',
      wallet: this.trcWallet,
      hash: this.hashTx,
      type: 'PayIn'
    };

    this.http.post(`${this.baseUrl}/transactions/payin`, body).subscribe(() => {
      alert('✅ Заявка на пополнение отправлена!');
      this.payAmount = 0;
      this.hashTx = '';
      this.isConfirmMode = false;
      this.loadProfile();
      this.tab = 'main';
    });
  }

  payOut() {
    if (!this.profile || this.payoutAmount <= 0 || !this.payoutWallet) return;
    const body = {
      profileId: this.profile.id,
      amount: this.payoutAmount,
      wallet: this.payoutWallet,
      currency: 'USDT',
      network: 'TRC20'
    };
    this.http.post(`${this.baseUrl}/transactions/payout`, body).subscribe(() => {
      alert('💸 Заявка на вывод отправлена!');
      this.payoutAmount = 0;
      this.payoutWallet = '';
      this.loadProfile();
      this.tab = 'main';
    });
  }
}
