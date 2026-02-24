import {
    BarChart,
    Bar as ReBar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import {
    format,
    isSameDay,
    subDays,
    eachDayOfInterval
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

const StatsCard = styled(Card)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const TabsWrapper = styled.div`
  display: flex;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 25px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  background-color: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.1)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--primary)' : 'var(--muted)')};
  font-weight: 600;
  font-size: 13px;
`;


const ChartContainer = styled(Card)`
  height: 240px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
`;

const Progresso = () => {
    const [tabAtiva, setTabAtiva] = useState('Log');
    const { usuario } = useAuth();
    const { dados } = useUsuario();
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!usuario) return;

        const q = query(
            collection(db, `treinos_historico/${usuario.uid}/lista`),
            orderBy('data', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHistorico(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [usuario]);

    const formatarData = (dateString) => {
        const data = new Date(dateString);
        const formatted = format(data, "dd 'de' MMM, HH:mm", { locale: ptBR });
        return formatted;
    };

    const formatarTempo = (segundos) => {
        const m = Math.floor(segundos / 60);
        return `${m} min`;
    };

    // Processar dados para o gráfico (últimos 7 dias)
    const ultimos7Dias = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
    });

    const dataGrafico = ultimos7Dias.map(dia => {
        const treinosNoDia = historico.filter(h => isSameDay(new Date(h.data), dia));
        return {
            name: format(dia, 'eee', { locale: ptBR }).toUpperCase().replace('.', ''),
            quantidade: treinosNoDia.length,
            fullDate: format(dia, 'dd/MM')
        };
    });

    return (
        <AppShell>
            <Container>
                <Typography.H1 style={{ marginTop: '20px', fontSize: '24px' }}>Meu Progresso</Typography.H1>

                <StatsCard style={{ marginTop: '20px' }}>
                    <Flex $justify="space-around">
                        <div style={{ textAlign: 'center' }}>
                            <Typography.Small style={{ fontSize: '11px' }}>Peso Atual</Typography.Small>
                            <h3 style={{ fontSize: '20px', color: 'var(--primary)', fontWeight: '700' }}>{dados?.peso || '--'} {dados?.unidadePeso || 'kg'}</h3>
                        </div>
                        <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ textAlign: 'center' }}>
                            <Typography.Small style={{ fontSize: '11px' }}>Meta</Typography.Small>
                            <h3 style={{ fontSize: '20px', color: 'var(--secondary)', fontWeight: '700' }}>{dados?.objetivo === 'Perder Peso' ? '70' : '85'} {dados?.unidadePeso || 'kg'}</h3>
                        </div>
                    </Flex>
                </StatsCard>

                <TabsWrapper>
                    <Tab $active={tabAtiva === 'Log'} onClick={() => setTabAtiva('Log')}>Histórico</Tab>
                    <Tab $active={tabAtiva === 'Charts'} onClick={() => setTabAtiva('Charts')}>Gráficos</Tab>
                </TabsWrapper>


                {tabAtiva === 'Charts' ? (
                    <div>
                        <Typography.H2 style={{ fontSize: '18px', marginBottom: '15px' }}>Frequência Semanal</Typography.H2>
                        <ChartContainer>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataGrafico} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--muted)', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: '#171726',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                        itemStyle={{ color: 'var(--primary)' }}
                                        labelStyle={{ color: 'var(--muted)', marginBottom: '4px' }}
                                    />
                                    <ReBar
                                        dataKey="quantidade"
                                        radius={[4, 4, 0, 0]}
                                        barSize={24}
                                    >
                                        {dataGrafico.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.quantidade > 0 ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}
                                            />
                                        ))}
                                    </ReBar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                        <Typography.Body style={{ marginTop: '20px', fontSize: '14px' }}>
                            Você realizou {historico.length} treinos no total. {historico.length > 0 ? 'Ótimo trabalho!' : 'Vamos começar hoje?'}
                        </Typography.Body>
                    </div>
                ) : (
                    <div>
                        <Flex $justify="space-between" style={{ marginBottom: '15px' }}>
                            <Typography.H2 style={{ fontSize: '18px' }}>Atividades Recentes</Typography.H2>
                            <FiCalendar size={16} color="var(--primary)" />
                        </Flex>

                        {loading ? (
                            <Typography.Body style={{ fontSize: '14px' }}>Carregando...</Typography.Body>
                        ) : historico.length === 0 ? (
                            <Typography.Body style={{ fontSize: '14px' }}>Nenhum treino realizado ainda.</Typography.Body>
                        ) : (
                            historico.map((act) => (
                                <ActivityItem key={act.id}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '14px', marginBottom: '2px', fontWeight: '600' }}>{act.nomeTreino}</h4>
                                        <Typography.Small style={{ fontSize: '11px' }}>
                                            {formatarData(act.data)} • {formatarTempo(act.duracaoSegundos)}
                                        </Typography.Small>
                                    </div>
                                    <div style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '13px', marginLeft: '10px' }}>
                                        {act.setsCompletosTotal}/{act.totalSetsPrevistos} séries
                                    </div>
                                </ActivityItem>
                            ))
                        )}
                    </div>
                )}
            </Container>
        </AppShell>
    );
};

export default Progresso;
