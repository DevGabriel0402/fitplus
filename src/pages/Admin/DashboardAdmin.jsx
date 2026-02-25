import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiLayout, FiPlusCircle, FiArrowLeft, FiBarChart2, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex } from '../../ui/components/BaseUI';
import { db } from '../../firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
`;

const AdminCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }

  .icon-box {
    width: 50px;
    height: 50px;
    border-radius: 15px;
    background-color: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    color: var(--primary);
    font-size: 24px;
  }
`;

const StatsStrip = styled(Card)`
  display: flex;
  justify-content: space-around;
  padding: 15px;
  margin-bottom: 25px;
  background: linear-gradient(135deg, var(--card) 0%, var(--surface) 100%);
`;

const Stat = styled.div`
  text-align: center;
  .val { font-size: 20px; font-weight: 800; color: var(--primary); display: block; }
  .lab { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
`;

const DashboardAdmin = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ usuarios: '--', treinos: '--', exercicios: '--' });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersSnap, workoutsSnap, exercisesSnap] = await Promise.all([
                    getDocs(collection(db, 'usuarios')),
                    getDocs(collection(db, 'treinos_sugeridos')),
                    getDocs(collection(db, 'exercicios'))
                ]);
                setStats({
                    usuarios: usersSnap.size,
                    treinos: workoutsSnap.size,
                    exercicios: exercisesSnap.size
                });
            } catch (error) {
                console.error("Erro ao carregar estatísticas:", error);
            }
        };
        fetchStats();
    }, []);

    const tools = [
        {
            title: "Alunos",
            desc: "Visualizar usuários",
            icon: <FiUsers />,
            path: "/admin/usuarios",
            color: "#4CAF50"
        },
        {
            title: "Artigos & Dicas",
            desc: "Postar novidades",
            icon: <FiBook />,
            path: "/admin/artigos",
            color: "#6C47FF"
        },
        {
            title: "Sugestões",
            desc: "Treinos oficiais",
            icon: <FiLayout />,
            path: "/admin/sugestoes",
            color: "#00D1FF"
        },
        {
            title: "Bibl. Exercícios",
            desc: "Cadastrar movimentos",
            icon: <FiPlusCircle />,
            path: "/biblioteca",
            color: "#FF8C00"
        },
        {
            title: "Feedbacks",
            desc: "Avaliações dos alunos",
            icon: <FiMessageSquare />,
            path: "/admin/feedbacks",
            color: "#FF4785"
        }
    ];

    return (
        <AppShell>
            <Container>
                <Flex $justify="space-between" style={{ marginTop: '20px', marginBottom: '10px' }}>
                    <button onClick={() => navigate('/perfil')}><FiArrowLeft size={24} color="var(--text)" /></button>
                    <Typography.H2 style={{ margin: 0 }}>Painel Admin</Typography.H2>
                    <div style={{ width: 24 }} />
                </Flex>

                <Typography.Body style={{ marginBottom: '30px', textAlign: 'center' }}>
                    Central de gerenciamento FitPlus
                </Typography.Body>

                <StatsStrip>
                    <Stat>
                        <span className="val">{stats.exercicios}</span>
                        <span className="lab">Exercícios</span>
                    </Stat>
                    <Stat>
                        <span className="val">{stats.treinos}</span>
                        <span className="lab">Sugestões</span>
                    </Stat>
                    <Stat>
                        <span className="val">{stats.usuarios}</span>
                        <span className="lab">Alunos</span>
                    </Stat>
                </StatsStrip>

                <DashboardGrid>
                    {tools.map((tool, idx) => (
                        <AdminCard key={idx} onClick={() => tool.path !== "#" && navigate(tool.path)}>
                            <div className="icon-box" style={{ color: tool.color }}>
                                {tool.icon}
                            </div>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{tool.title}</h4>
                            <Typography.Small style={{ fontSize: '10px', opacity: 0.7 }}>{tool.desc}</Typography.Small>
                        </AdminCard>
                    ))}
                </DashboardGrid>

                <Card style={{ marginTop: '25px', padding: '15px', borderStyle: 'dashed', opacity: 0.6 }}>
                    <Typography.Small style={{ textAlign: 'center', display: 'block' }}>
                        Área restrita para administradores.
                    </Typography.Small>
                </Card>
            </Container>
        </AppShell>
    );
};

export default DashboardAdmin;
