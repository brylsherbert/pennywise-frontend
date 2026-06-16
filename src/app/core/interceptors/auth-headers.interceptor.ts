import { Injectable, inject } from '@angular/core';
import {
    HttpRequest,
    HttpInterceptor,
    HttpHandler,
    HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { AuthStore } from '../services/store/auth.store';

function isAppApiRequest(url: string): boolean {
    const baseUrl = environment?.apiUrl;
    return !!(baseUrl && url.startsWith(baseUrl));
}

@Injectable()
export class AuthHeadersInterceptor implements HttpInterceptor {
    private readonly authStore = inject(AuthStore);

    private readonly userToken = this.authStore.userToken;

    intercept(
        req: HttpRequest<unknown>,
        next: HttpHandler
    ): Observable<HttpEvent<unknown>> {
        if (!isAppApiRequest(req.url)) {
            return next.handle(req);
        }
        const bearerToken = this.userToken();

        const authValue = bearerToken ? `Bearer ${bearerToken}` : null;

        if (!authValue) return next.handle(req);

        const headers = req.headers.set('Authorization', authValue);
        const cloned = req.clone({ headers });
        return next.handle(cloned);
    }
}
