import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'smart_ecart_token';
  private userKey = 'smart_ecart_user';

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(this.userKey);
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch {
        this.logout();
      }
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((res) => this.handleAuthSuccess(res))
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => this.handleAuthSuccess(res))
    );
  }

  getProfile(): Observable<{ success: boolean; data: User }> {
    return this.http.get<{ success: boolean; data: User }>(`${this.apiUrl}/me`);
  }

  updateProfile(data: Partial<User>): Observable<{ success: boolean; data: User }> {
    return this.http
      .put<{ success: boolean; data: User }>(`${this.apiUrl}/profile`, data)
      .pipe(
        tap((res) => {
          this.currentUserSubject.next(res.data);
          localStorage.setItem(this.userKey, JSON.stringify(res.data));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.data.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.data.user));
    this.currentUserSubject.next(res.data.user);
  }
}
