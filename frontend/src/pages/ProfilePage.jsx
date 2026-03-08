import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <section className="card">
      <h2>Perfil</h2>

      {!user ? (
        <p>Carregando perfil...</p>
      ) : (
        <>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </>
      )}
    </section>
  );
}