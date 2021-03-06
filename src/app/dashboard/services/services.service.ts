import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs/Observable';
import gql from 'graphql-tag';
import {
  queryServices,
  queryServicesById,
  mutationCreateService,
  mutationUpdateService,
  mutationDeleteService
} from './services.queries';

@Injectable()
export class ServicesService {

  userAuth: any;

  constructor(private apollo: Apollo) {
    this.userAuth = JSON.parse(localStorage.getItem('userAuth'));
  }

  public getServices(subsystemId?) {
    return this.apollo.watchQuery<any>({
      query: queryServices,
      variables: {
        query: subsystemId,
        uid: this.userAuth.uid,
        credential: this.userAuth.token
      }
    }).valueChanges
  }

  public getServiceById(id: string) {
    return this.apollo.watchQuery<any>({
      query: queryServicesById,
      variables: {
        pk: id,
        uid: this.userAuth.uid,
        credential: this.userAuth.token
      }
    }).valueChanges
  }

  public createService(supplie) {
    return this.apollo.mutate({
      mutation: mutationCreateService,
      variables: {
        nombre: supplie.nombre,
        descripcion: supplie.descripcion,
        codigoLpu: supplie.codigoLpu,
        unidad: supplie.unidad,
        distancia: supplie.distancia,
        peso: supplie.peso,
        tiempo: supplie.tiempo,
        subsistema: supplie.subsistema,
        valorLpu: supplie.valorLpu,
        descripcionLpu: supplie.descripcionLpu,
        uid: this.userAuth.uid,
        credential: this.userAuth.token
      },
      refetchQueries: [{
        query: queryServices,
        variables: { uid: this.userAuth.uid, credential: this.userAuth.token }
      }]
    })
  }

  public updateService(id, supplie) {
    return this.apollo.mutate({
      mutation: mutationUpdateService,
      variables: {
        pk: id,
        nombre: supplie.nombre,
        descripcion: supplie.descripcion,
        codigoLpu: supplie.codigoLpu,
        unidad: supplie.unidad,
        distancia: supplie.distancia,
        peso: supplie.peso,
        tiempo: supplie.tiempo,
        subsistema: supplie.subsistema,
        valorLpu: supplie.valorLpu,
        descripcionLpu: supplie.descripcionLpu,
        uid: this.userAuth.uid,
        credential: this.userAuth.token
      },
      refetchQueries: [{
        query: queryServices,
        variables: { uid: this.userAuth.uid, credential: this.userAuth.token }
      }]
    })
  }

  public deleteService(id) {
    return this.apollo.mutate({
      mutation: mutationDeleteService,
      variables: {
        pk: id,
        uid: this.userAuth.uid,
        credential: this.userAuth.token
      },
      refetchQueries: [{
        query: queryServices,
        variables: { uid: this.userAuth.uid, credential: this.userAuth.token }
      }]
    })
  }

}
