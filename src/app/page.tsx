"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Limpiar cualquier error previo

    try {
      const data = {
        email: formData.email,
        password: formData.password,
      };

      const jsonData = JSON.stringify(data);

      const response = await fetch("https://bildy-rpmaya.koyeb.app/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: jsonData,
      });

      if (response.ok) {
        const result = await response.json();

        if (result.token) {
          localStorage.setItem("jwt", result.token);
          localStorage.setItem("username", formData.email);

          alert("Registro exitoso.");
          router.push("/verify"); // Redirigir a la página de verificación
        } else {
          throw new Error("No se recibió un token en la respuesta.");
        }
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Error al procesar la solicitud.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Regístrate</h1>
        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Cargando..." : "Registrarse"}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
      </div>

      {/* Botón flotante */}
      <div style={styles.floatingButtonContainer}>
        <button
          style={styles.floatingButton}
          onClick={() => router.push("/login")}
        >
          Ir a Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
    margin: "1rem",
  },
  title: {
    fontSize: "24px",
    marginBottom: "1rem",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "0.75rem",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#0070f3",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  error: {
    color: "red",
    marginTop: "1rem",
  },
  floatingButtonContainer: {
    position: "fixed",
    bottom: "20px", // Distancia desde el fondo
    right: "20px",  // Distancia desde la derecha
    zIndex: 1000, // Asegúrate de que esté por encima de otros elementos
  },
  floatingButton: {
    padding: "15px 30px",
    borderRadius: "50px",
    backgroundColor: "#ff5722", // Color atractivo para el botón
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
    transition: "transform 0.3s, box-shadow 0.3s, background-color 0.3s",
  },
};
