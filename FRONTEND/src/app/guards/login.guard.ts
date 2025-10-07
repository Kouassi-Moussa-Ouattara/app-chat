import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthServiceService } from '../service/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  if(inject(AuthServiceService).isLoggedIn()){
    return false;
  }
  return true;
};
