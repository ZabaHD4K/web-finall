"use client";

import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<string>("Clientes"); // Sección activa
  const [showAddClientModal, setShowAddClientModal] = useState(false); // Modal para añadir cliente
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false); // Modal para añadir material (pedido)
  const [clients, setClients] = useState<any[]>([]); // Estado para clientes
  const [materials, setMaterials] = useState<any[]>([]); // Estado para materiales (pedidos)
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

    const materialData = {
      name: newMaterial.name,
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
        throw new Error("Error al añadir el pedido.");
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
                    <p>Dirección: {client.address.street}, {client.address.number}, {client.address.city}, {client.address.province}</p>
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

      {/* Modal para añadir material (pedido) */}
      {showAddMaterialModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2>Añadir Pedido</h2>
            <form onSubmit={handleAddMaterial}>
              <input
                type="text"
                name="name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ name: e.target.value })}
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
