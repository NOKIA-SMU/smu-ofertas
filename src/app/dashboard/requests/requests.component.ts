import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatSort, MatTableDataSource, MatPaginator } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { RequestsService } from "./requests.service";
import { AuthService } from '../../auth/auth.service';
import { AppService } from "../../app.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['../dashboard.component.scss', './requests.component.scss']
})

export class RequestsComponent implements OnInit {

  displayedColumns = [
    'id',
    'supervisor',
    'analista',
    'tas',
    'estacion',
    'subsistema',
    'prioridad',
    'estadoSolicitud',
    'creado',
    'actualizado'
  ];

  dataSource = new MatTableDataSource();
  isLoadingResults = true;
  currentRowSelect: any;
  currentRowSelectData: any = {};
  currentUser: any;
  requests: any;

  permissionsView = {
    crear: null,
    leer: null,
    editar: null,
    eliminar: null,
    exportar: null,
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private requestsService: RequestsService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private appService: AppService
  ) {
    this.appService.validateSecurity(this.route.snapshot.routeConfig.path)
      .then(res => {
        this.permissionsView = {
          crear: res['crear'],
          leer: res['leer'],
          editar: res['editar'],
          eliminar: res['eliminar'],
          exportar: res['exportar']
        }
      }, error => {
        this.appService.showSwal('cancel', 'error', 'Operación no exitosa', 'Validación de seguridad', error);
      })
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.authService.currentUser()
      .subscribe(res => {
        this.currentUser = res;
        this.requestsService.getRequests()
          .subscribe(res => {
            this.requests = res.data.solicitudes;
            // Filter requests by rol
            let filteredRequests = [];
            if (this.currentUser) {
              if (this.currentUser.roles.Administrador) {
                this.dataSource = new MatTableDataSource(res.data.solicitudes);
              } else if (this.currentUser.roles.Supervisor) {
                for (let i = 0; i < res.data.solicitudes.length; i++) {
                  if (res.data.solicitudes[i].supervisorId == this.currentUser.id) {
                    filteredRequests.push(res.data.solicitudes[i]);
                  }
                }
                this.dataSource = new MatTableDataSource(filteredRequests);
              } else if (this.currentUser.roles.Analista) {
                for (let i = 0; i < res.data.solicitudes.length; i++) {
                  if (res.data.solicitudes[i].analistaId === this.currentUser.id) {
                    filteredRequests.push(res.data.solicitudes[i]);
                  }
                }
                this.dataSource = new MatTableDataSource(filteredRequests);
              } else {
                this.dataSource = new MatTableDataSource(res.data.solicitudes);
              }
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              this.isLoadingResults = false;
            }
          }, error => {
            this.isLoadingResults = false;
            this.appService.showSwal('cancel', 'error', 'Operación no exitosa', 'Consulta de solicitudes', error);
          });
        }, error => {
          this.appService.showSwal('cancel', 'error', 'Operación no exitosa', 'Consulta de usuario actual', error);
        })
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

  selectRow(index, data) {
    this.currentRowSelect = index;
    this.currentRowSelectData = data;
  }

  goToEdit() {
    this.router.navigate([`dashboard/solicitudes/${this.currentRowSelectData.id}`]);
  }

  goToCreate() {
    this.router.navigate([`dashboard/solicitudes/crear`]);
  }

  deleteRequest() {
    this.requestsService.deleteRequest(this.currentRowSelectData.id)
      .subscribe(res => {
        if (res.data.deleteSolicitud.status == 200)
          this.router.navigate(['/solicitudes']);
      }, error => {
        this.appService.showSwal('cancel', 'error', 'Operación no exitosa', 'Eliminar solicitud', error);
      })
  }

  export() {
    localStorage.setItem('currentExport', 'requests');
    this.router.navigate(['dashboard/exportar'], { queryParams: this.currentUser.roles, skipLocationChange: true });
  }

  isArray(obj: any) {
    return Array.isArray(obj);
  }

}
