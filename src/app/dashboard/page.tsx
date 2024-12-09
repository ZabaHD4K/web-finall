"use client";

import { useState, useEffect } from "react";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<string>("Clientes"); // Sección activa
  const [showAddClientModal, setShowAddClientModal] = useState(false); // Modal para añadir cliente
  const [clients, setClients] = useState<any[]>([]); // Estado para almacenar los clientes
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de error

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
          Authorization: `Bearer ${token}`, // Autenticación con el token
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

  useEffect(() => {
    if (activeSection === "Clientes") {
      fetchClients(); // Cargar los clientes al mostrar la sección
    }
  }, [activeSection]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
        return <h2>Lista de Pedidos</h2>;
      case "Proyectos":
        return <h2>Lista de Proyectos</h2>;
      case "Albaranes":
        return <h2>Lista de Albaranes</h2>;
      case "Proveedores":
        return <h2>Lista de Proveedores</h2>;
      default:
        return <h2>Seleccione una sección</h2>;
    }
  };

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
                onChange={handleChange}
                placeholder="Nombre"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="cif"
                value={newClient.cif}
                onChange={handleChange}
                placeholder="CIF"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="street"
                value={newClient.street}
                onChange={handleChange}
                placeholder="Calle"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="number"
                value={newClient.number}
                onChange={handleChange}
                placeholder="Número"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="postal"
                value={newClient.postal}
                onChange={handleChange}
                placeholder="Código Postal"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="city"
                value={newClient.city}
                onChange={handleChange}
                placeholder="Ciudad"
                required
                style={modalStyles.input}
              />
              <input
                type="text"
                name="province"
                value={newClient.province}
                onChange={handleChange}
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
