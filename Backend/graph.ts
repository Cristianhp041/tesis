/*

####### Provincia 

mutation {
  createProvincia(data: { nombre: "Granma" }) {
    id
    nombre
  }
}

mutation {
  createProvincia(data: { nombre: "Granma" }) {
    id
    nombre
  }
}

query {
  provincia(id: 1) {
    id
    nombre
  }
}

query {
  provincia(id: 1) {
    id
    nombre
  }
}

mutation {
  removeProvincia(id: 1)
}

#######  Municipio

mutation {
  createMunicipio(data: { nombre: "Bayamo", provinciaId: 1 }) {
    id
    nombre
    provincia {
      id
      nombre
    }
  }
}

query {
  municipios {
    id
    nombre
    provincia {
      id
      nombre
    }
  }
}
  ####### Cargo

mutation {
  createCargo(data: { nombre: "Director", descripcion: "Jefe máximo" }) {
    id
    nombre
    descripcion
  }
}

query {
  cargos {
    id
    nombre
    descripcion
    trabajadores {
      id
      nombre
    }
  }
}

####### Area

mutation {
  createArea(data: { nombre: "Contabilidad", descripcion: "Área contable" }) {
    id
    nombre
    descripcion
    createdAt
  }
}

mutation {
  createArea(data: { nombre: "Sub Contabilidad", parentId: 1 }) {
    id
    nombre
    parentId
  }
}


query {
  areas {
    id
    nombre
    descripcion
    parentId
    children {
      id
      nombre
    }
  }
}
  
####### Trabjadores 

mutation {
  createTrabajador(data: {
    nombre: "Andy"
    apellidos: "Suárez Oña"
    expediente: "T23505"
    telefono: "55730509"
    cargoId: 1
    municipioId: 1
    provinciaId: 1
  }) {
    id
    nombre
    apellidos
    telefono
    cargo {
      nombre
    }
    municipio {
      nombre
    }
    provincia {
      nombre
    }
  }
}

query {
  trabajadores {
    id
    nombre
    apellidos
    cargo {
      nombre
    }
    municipio {
      nombre
    }
    provincia {
      nombre
    }
  }
}

mutation {
  createAft(data: {
    rotulo: "AFT-001"
    nombre: "Computadora Dell"
    subclasificacion: "Tecnología"
    areaId: 1
  }) {
    id
    rotulo
    nombre
    area {
      nombre
    }
    historial {
      descripcion
      fecha
    }
  }
}

mutation {
  moverAft(id: 1, nuevaAreaId: 2) {
    id
    area {
      id
      nombre
    }
  }
}

mutation {
  desactivarAft(id: 1) {
    id
    activo
  }
}

query {
  afts {
    id
    rotulo
    nombre
    subclasificacion
    activo
    area {
      nombre
    }
    historial {
      descripcion
      fecha
    }
  }
}
*/