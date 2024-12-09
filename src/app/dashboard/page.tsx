"use client";

import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<string>("Clientes"); // Sección activa
  const [showAddClientModal, setShowAddClientModal] = useState(false); // Modal para añadir cliente
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false); // Modal para añadir pedido
  const [clients, setClients] = useState<any[]>([]); // Estado para clientes
  const [materials, setMaterials] = useState<any[]>([]); // Estado para pedidos
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error
  const [userId, setUserId] = useState<string | null>(null); // ID del usuario autenticado

  // Datos del formulario para cliente
  const [newClient, setNewClient] = useState({
    name: "",
    cif: "",
    street: "",
    number: "",
    postal: "",
    city: "",
    province: "",
  });

  // Datos del formulario para material (pedido)
  const [newMaterial, setNewMaterial] = useState({
    name: "",
  });

  // Cargar el ID del usuario desde el token JWT
  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decodificar el token JWT
      setUserId(decodedToken.userId); // Establecer el userId desde el token
    }
  }, []);

  // Cargar los clientes desde la API
  const fetchClients = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("jwt");

    if (!token) {
      alert("No se ha encontrado el token de autenticación.");
      return;
    }

    try {
      const response = await fetch("https://bildy-rpmaya.koyeb.app/api/client", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los clientes.");
      }

      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError("Error al obtener los clientes. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar los pedidos desde la API
  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("jwt");

    if (!token) {
      alert("No se ha encontrado el token de autenticación.");
      return;
    }

    try {
      const response = await fetch("https://bildy-rpmaya.koyeb.app/api/material", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los pedidos.");
      }

      const data = await response.json();

      // Filtrar los pedidos solo para el usuario autenticado
      const filteredData = data.filter((material: any) => material.userId === userId);
      setMaterials(filteredData);
    } catch (err) {
      setError("Error al obtener los pedidos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Añadir un nuevo cliente
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");

    if (!token) {
      alert("No se ha encontrado el token de autenticación.");
      return;
    }

    const number = parseInt(newClient.number);
    const postal = parseInt(newClient.postal);

    if (isNaN(number) || isNaN(postal)) {
      alert("El número o el código postal no son válidos.");
      return;
    }

    if (newClient.cif.length < 9) {
      alert("El CIF debe tener al menos 9 caracteres.");
      return;
    }

    const clientData = {
      name: newClient.name,
      cif: newClient.cif,
      address: {
        street: newClient.street,
        number: number,
        postal: postal,
        city: newClient.city,
        province: newClient.province,
      },
    };

    try {
      const response = await fetch("https://bildy-rpmaya.koyeb.app/api/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error("Error al añadir el cliente.");
      }

      const data = await response.json();
      alert("Cliente añadido con éxito.");
      setShowAddClientModal(false);
      setNewClient({
        name: "",
        cif: "",
        street: "",
        number: "",
        postal: "",
        city: "",
        province: "",
      });

      // Refrescar la lista de clientes
      fetchClients();
    } catch (error) {
      alert(`Hubo un problema al añadir el cliente: ${error.message}`);
    }
  };

  // Añadir un nuevo pedido
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");

    if (!token) {
      alert("No se ha encontrado el token de autenticación.");
      return;
    }

    if (!newMaterial.name.trim()) {
      alert("El nombre del material no puede estar vacío.");
      return;
    }

    const materialData = {
      name: newMaterial.name.trim(),
      userId: userId, // Asignar el ID del usuario al pedido
    };

    try {
      const response = await fetch("https://bildy-rpmaya.koyeb.app/api/material", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(materialData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || "No se pudo añadir el pedido"}`);
      }

      const data = await response.json();
      alert("Pedido añadido con éxito.");
      setShowAddMaterialModal(false);
      setNewMaterial({
        name: "",
      });

      // Refrescar la lista de pedidos
      fetchMaterials();
    } catch (error) {
      console.error("Error al añadir el pedido:", error);
      alert(`Hubo un problema al añadir el pedido: ${error.message}`);
    }
  };

  // Mostrar la sección activa
  const renderSection = () => {
    switch (activeSection) {
      case "Clientes":
        return (
          <div>
            <h2>Lista de Clientes</h2>
            {loading ? (
              <p>Cargando clientes...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <ul>
                {clients.map((client) => (
                  <li key={client._id}>
                    <strong>{client.name}</strong>
                    <p>CIF: {client.cif}</p>
                    <p>
                      Dirección: {client.address.street}, {client.address.number},{" "}
                      {client.address.city}, {client.address.province}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setShowAddClientModal(true)}
              style={{
                backgroundColor: "#0070f3",
                color: "#fff",
                border: "none",
                padding: "10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Añadir Cliente
            </button>
          </div>
        );
      case "Pedidos":
        return (
          <div>
            <h2>Lista de Pedidos</h2>
            {loading ? (
              <p>Cargando pedidos...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <ul>
                {materials.map((material) => (
                  <li key={material._id}>
                    <strong>{material.name}</strong>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setShowAddMaterialModal(true)}
              style={{
                backgroundColor: "#0070f3",
                color: "#fff",
                border: "none",
                padding: "10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Añadir Pedido
            </button>
          </div>
        );
      case "Proyectos":
        return <ProjectsSection />;
      case "Albaranes":
        return <DeliveryNotesSection />;
      default:
        return <h2>Seleccione una sección</h2>;
    }
  };

  useEffect(() => {
    if (activeSection === "Clientes") {
      fetchClients(); // Cargar los clientes al mostrar la sección
    } else if (activeSection === "Pedidos") {
      fetchMaterials(); // Cargar los pedidos al mostrar la sección
    }
  }, [activeSection]);

  return (
    <div style={styles.container}>
      {/* Barra lateral de navegación */}
      <aside style={styles.sidebar}>
        <ul style={styles.menu}>
          {["Clientes", "Pedidos", "Proyectos", "Albaranes", "Proveedores"].map(
            (section) => (
              <li
                key={section}
                onClick={() => setActiveSection(section)}
                style={{
                  ...styles.menuItem,
                  backgroundColor:
                    activeSection === section ? "#0070f3" : "transparent",
                  color: activeSection === section ? "#fff" : "#000",
                }}
              >
                {section}
              </li>
            )
          )}
        </ul>
      </aside>

      {/* Contenido principal */}
      <main style={styles.content}>
        {renderSection()}
      </main>

      {/* Modal para añadir cliente */}
      {showAddClientModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2>Añadir Cliente</h2>
            <form onSubmit={handleAddClient}>
              <input
                type="text"
                name="name"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
                placeholder="Nombre"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="cif"
                value={newClient.cif}
                onChange={(e) =>
                  setNewClient({ ...newClient, cif: e.target.value })
                }
                placeholder="CIF"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="street"
                value={newClient.street}
                onChange={(e) =>
                  setNewClient({ ...newClient, street: e.target.value })
                }
                placeholder="Calle"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="number"
                value={newClient.number}
                onChange={(e) =>
                  setNewClient({ ...newClient, number: e.target.value })
                }
                placeholder="Número"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="postal"
                value={newClient.postal}
                onChange={(e) =>
                  setNewClient({ ...newClient, postal: e.target.value })
                }
                placeholder="Código Postal"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="city"
                value={newClient.city}
                onChange={(e) =>
                  setNewClient({ ...newClient, city: e.target.value })
                }
                placeholder="Ciudad"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="province"
                value={newClient.province}
                onChange={(e) =>
                  setNewClient({ ...newClient, province: e.target.value })
                }
                placeholder="Provincia"
                required
                style={modalStyles.input}
              />
              <button
                type="submit"
                style={{
                  ...modalStyles.button,
                  backgroundColor: "#0070f3",
                  color: "#fff",
                }}
              >
                Guardar Cliente
              </button>
              <button
                type="button"
                onClick={() => setShowAddClientModal(false)}
                style={modalStyles.button}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para añadir pedido */}
      {showAddMaterialModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2>Añadir Pedido</h2>
            <form onSubmit={handleAddMaterial}>
              <input
                type="text"
                name="name"
                value={newMaterial.name}
                onChange={(e) =>
                  setNewMaterial({ ...newMaterial, name: e.target.value })
                }
                placeholder="Nombre del material"
                required
                style={modalStyles.input}
              />
              <button
                type="submit"
                style={{
                  ...modalStyles.button,
                  backgroundColor: "#0070f3",
                  color: "#fff",
                }}
              >
                Guardar Pedido
              </button>
              <button
                type="button"
                onClick={() => setShowAddMaterialModal(false)}
                style={modalStyles.button}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const ProjectsSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    projectCode: "",
    email: "",
    street: "",
    number: "",
    postal: "",
    city: "",
    province: "",
    code: "",
    clientId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");

    if (!token) {
      alert("No se ha encontrado el token de autenticación.");
      return;
    }

    try {
      const response = await fetch("https://bildy-rpmaya.koyeb.app/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          projectCode: formData.projectCode,
          email: formData.email,
          address: {
            street: formData.street,
            number: formData.number,
            postal: formData.postal,
            city: formData.city,
            province: formData.province,
          },
          code: formData.code,
          clientId: formData.clientId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al añadir el proyecto. Código de error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Project added:', data);
      alert("Proyecto añadido con éxito.");
      setShowForm(false);
      setFormData({
        name: "",
        projectCode: "",
        email: "",
        street: "",
        number: "",
        postal: "",
        city: "",
        province: "",
        code: "",
        clientId: "",
      });
    } catch (error) {
      alert(`Hubo un problema al añadir el proyecto: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Proyectos</h2>
      <button
        onClick={() => setShowForm(true)}
        style={{
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          padding: "10px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Añadir Proyectos
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <input
            type="text"
            name="name"
            placeholder="Nombre del proyecto"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="text"
            name="projectCode"
            placeholder="Identificador de proyecto"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="text"
            name="street"
            placeholder="Calle"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="number"
            name="number"
            placeholder="Número"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="text"
            name="postal"
            placeholder="Código postal"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="text"
            name="city"
            placeholder="Ciudad"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="text"
            name="province"
            placeholder="Provincia"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="text"
            name="code"
            placeholder="Código interno del proyecto"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="text"
            name="clientId"
            placeholder="ID del cliente"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <button
            type="submit"
            style={{
              ...modalStyles.button,
              backgroundColor: "#0070f3",
              color: "#fff",
            }}
          >
            Enviar
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            style={modalStyles.button}
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
};

const DeliveryNotesSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    projectId: "",
    format: "",
    material: "",
    hours: 0,
    description: "",
    workdate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");

    if (!token) {
      alert("No se ha encontrado el token de autenticación.");
      return;
    }

    try {
      const response = await fetch("https://bildy-rpmaya.koyeb.app/api/deliverynote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error al añadir el albarán. Código de error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Delivery note added:', data);
      alert("Albarán añadido con éxito.");
      setShowForm(false);
      setFormData({
        clientId: "",
        projectId: "",
        format: "",
        material: "",
        hours: 0,
        description: "",
        workdate: "",
      });
    } catch (error) {
      alert(`Hubo un problema al añadir el albarán: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Albaranes</h2>
      <button
        onClick={() => setShowForm(true)}
        style={{
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          padding: "10px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Añadir Albarán
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <input
            type="text"
            name="clientId"
            placeholder="ID del cliente"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="text"
            name="projectId"
            placeholder="ID del proyecto"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <select
            name="format"
            onChange={handleChange}
            required
            style={modalStyles.input}
          >
            <option value="">Seleccionar formato</option>
            <option value="material">Material</option>
            <option value="hours">Horas</option>
          </select>
          <input
            type="text"
            name="material"
            placeholder="Tipo de material"
            onChange={handleChange}
            style={modalStyles.input}
          />
          <input
            type="number"
            name="hours"
            placeholder="Horas"
            onChange={handleChange}
            style={modalStyles.input}
          />
          <input
            type="text"
            name="description"
            placeholder="Descripción"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <input
            type="date"
            name="workdate"
            placeholder="Fecha de trabajo"
            onChange={handleChange}
            required
            style={modalStyles.input}
          />
          <button
            type="submit"
            style={{
              ...modalStyles.button,
              backgroundColor: "#0070f3",
              color: "#fff",
            }}
          >
            Enviar
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            style={modalStyles.button}
          >
            Cancelar
          </button>
        </form>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: "200px",
    backgroundColor: "#f4f4f4",
    padding: "10px",
    borderRight: "1px solid #ddd",
  },
  menu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  menuItem: {
    padding: "10px 15px",
    cursor: "pointer",
    borderRadius: "4px",
    margin: "5px 0",
    transition: "all 0.3s",
  },
  content: {
    flex: 1,
    padding: "20px",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  input: {
    width: "100%",
    margin: "10px 0",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  },
};