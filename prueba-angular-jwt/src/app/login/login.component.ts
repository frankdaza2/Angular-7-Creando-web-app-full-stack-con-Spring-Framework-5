import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Usuario } from '../login/usuario';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  titulo: string = 'Por favor inicie sesión';
  
  private subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]]
    });
    
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/persona']);
    } else {
      this.authService.logout();
    }
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  login(): void {
    if (!this.loginForm.valid) {
      Swal.fire(
        'Error Login',
        'Debe ingresar un usuario y contraseña!',
        'error'
      );
    } else {
      let usuario: Usuario = new Usuario();
      usuario.username = this.loginForm.get('username').value.trim();
      usuario.password = this.loginForm.get('password').value.trim();

      this.subscription = this.authService.login(usuario).subscribe((response: any) => {        
        this.authService.guardarUsuario(response.access_token);
        this.authService.guardarToken(response.access_token);
        this.router.navigate(['/persona']);
      }, error => {
        if (error.status === 400 || error.status === 401) {
          Swal.fire(
            'Error Login',
            'Usuario o contraseña incorrectas!',
            'error'
          );
        }
      });
    }
  }

}
