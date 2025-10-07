import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  if(inject(AuthServiceService).isLoggedIn()){
    return true;
  }
  inject(Router).navigate(["/login"]);
  return false;
};
