"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string>("Clientes");
  const [clients, setClients] = useState<any[]>([]); // Estado para clientes
  const [loading, setLoading] = useState<boolean>(false); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado de errores

  // Estado para formulario de nuevo cliente
  const [newClient, setNewClient] = useState({
    name: "",
    cif: "",
    street: "",
    number: "",
    postal: "",
    city: "",
    province: ""
  });

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const userEmail = localStorage.getItem("username");

    if (!token || !userEmail) {
      router.push("/login"); // Redirige al login si no está autenticado
    } else {
      setUsername(userEmail); // Establece el nombre de usuario
    }
  }, [router]);

  // Obtener clientes de la API
  useEffect(() => {
    if (activeMenu === "Clientes") {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("jwt");

      fetch("https://bildy-rpmaya.koyeb.app/api/client", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Error ${response.status}: ${
                response.statusText || "No se pudo obtener los datos"
              }`
            );
          }
          return response.json();
        })
        .then((data) => {
          setClients(data); // Guarda los clientes en el estado
        })
        .catch((err) => {
          console.error(err);
          setError("No se pudieron cargar los clientes. Intenta nuevamente.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [activeMenu]);

  // Función para manejar el cambio en los inputs del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("jwt");

    fetch("https://bildy-rpmaya.koyeb.app/api/client", {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
      name: newClient.name,
      cif: newClient.cif,
      address: {
        street: newClient.street,
        number: newClient.number,
        postal: newClient.postal,
        city: newClient.city,
        province: newClient.province
      }
      }),
    })
      .then((response) => {
      if (!response.ok) {
        throw new Error(
        `Error ${response.status}: ${
          response.statusText || "No se pudo agregar el cliente"
        }`
        );
      }
      return response.json();
      })
      .then((data) => {
      setClients((prevClients) => [...prevClients, data]); // Añade el nuevo cliente al estado
      setNewClient({
        name: "",
        cif: "",
        street: "",
        number: "",
        postal: "",
        city: "",
        province: ""
      }); // Resetea el formulario
      })
      .catch((err) => {
      console.error(err);
      setError("No se pudo agregar el cliente. Intenta nuevamente.");
      })
      .finally(() => {
      setLoading(false);
      });
  };

  // Contenido dinámico basado en el menú seleccionado
  const renderContent = () => {
    switch (activeMenu) {
      case "Clientes":
        if (loading) return <p>Cargando clientes...</p>;
        if (error) return <p>{error}</p>;
        if (clients.length === 0) return <p>No hay clientes disponibles.</p>;

        return (
          <div style={styles.clientsContainer}>
            {/* Lista de clientes */}
            <ul style={styles.clientList}>
              {clients.map((client) => (
                <li key={client._id} style={styles.clientItem}>
                  <h3>{client.name}</h3>
                  <p>
                    CIF: {client.cif}
                    <br />
                    Dirección: {client.address.street}, {client.address.number},{" "}
                    {client.address.postal} {client.address.city},{" "}
                    {client.address.province}
                    <br />
                    Proyectos Activos: {client.activeProjects}
                    <br />
                    Albaranes Pendientes: {client.pendingDeliveryNotes}
                  </p>
                  {client.logo && (
                    <img
                      src={client.logo}
                      alt={`Logo de ${client.name}`}
                      style={styles.clientLogo}
                    />
                  )}
                </li>
              ))}
            </ul>

            {/* Botón para añadir cliente */}
            <button
              onClick={() => setActiveMenu("Añadir Cliente")}
              style={styles.addButton}
            >
              Añadir Cliente
            </button>
          </div>
        );

      case "Añadir Cliente":
        return (
          <div>
            <h2>Añadir nuevo cliente</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                value={newClient.name}
                onChange={handleChange}
                placeholder="Nombre del cliente"
                required
              />
              <input
                type="text"
                name="cif"
                value={newClient.cif}
                onChange={handleChange}
                placeholder="CIF"
                required
              />
              <input
                type="text"
                name="street"
                value={newClient.street}
                onChange={handleChange}
                placeholder="Calle"
                required
              />
              <input
                type="text"
                name="number"
                value={newClient.number}
                onChange={handleChange}
                placeholder="Número"
                required
              />
              <input
                type="text"
                name="postal"
                value={newClient.postal}
                onChange={handleChange}
                placeholder="Código postal"
                required
              />
              <input
                type="text"
                name="city"
                value={newClient.city}
                onChange={handleChange}
                placeholder="Ciudad"
                required
              />
              <input
                type="text"
                name="province"
                value={newClient.province}
                onChange={handleChange}
                placeholder="Provincia"
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Añadir Cliente"}
              </button>
            </form>
          </div>
        );

      default:
        return <p>Selecciona una opción del menú.</p>;
    }
  };

  return (
    <div style={styles.container}>
      {/* Barra superior */}
      <header style={styles.header}>
        {username ? <span>Usuario: {username}</span> : <span>Cargando...</span>}
      </header>

      {/* Contenedor principal con menú lateral y contenido */}
      <div style={styles.main}>
        {/* Menú lateral */}
        <aside style={styles.sidebar}>
          <ul style={styles.menu}>
            {["Clientes", "Proyectos", "Albaranes", "Proveedores"].map((menu) => (
              <li
                key={menu}
                style={{
                  ...styles.menuItem,
                  backgroundColor: activeMenu === menu ? "#0070f3" : "transparent",
                  color: activeMenu === menu ? "#fff" : "#333",
                }}
                onClick={() => setActiveMenu(menu)}
              >
                {menu}
              </li>
            ))}
          </ul>
        </aside>

        {/* Contenido principal */}
        <section style={styles.content}>
          <h1>{activeMenu}</h1>
          {renderContent()}
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column" as const,
  },
  header: {
    backgroundColor: "#0070f3",
    color: "#fff",
    padding: "10px 20px",
    textAlign: "right" as const,
    fontSize: "16px",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "row" as const,
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
    transition: "background-color 0.3s, color 0.3s",
  },
  addButton: {
    backgroundColor: "#0070f3",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "20px",
  },
  clientsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  clientList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    flex: 1,
  },
  clientItem: {
    border: "1px solid #ddd",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
  },
  clientLogo: {
    maxWidth: "100px",
    maxHeight: "50px",
  },
};