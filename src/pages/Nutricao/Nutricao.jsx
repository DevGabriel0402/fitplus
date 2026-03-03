import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiSearch, FiPlus, FiPieChart, FiChevronLeft, FiChevronRight, FiCheck, FiChevronDown, FiX } from 'react-icons/fi';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField, InputWrapper } from '../../ui/components/BaseUI';
import { searchProducts } from '../../services/openFoodFacts';
import { useAuth } from '../../contexts/AuthContexto';
import { useUsuario } from '../../hooks/useUsuario';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
// Fallback if AnimatePresence is missing from framer-motion export in this setup
import * as framerMotion from 'framer-motion';
const AnimatePresence = framerMotion.AnimatePresence || (({ children }) => <>{children}</>);

const MacrosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
`;

const MacroCard = styled(Card)`
  padding: 15px;
  text-align: center;
  border: 1px solid var(--border);

  .value { font-size: 20px; font-weight: 800; color: var(--text); }
  .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
  .meta { font-size: 10px; color: var(--primary); margin-top: 2px; }
`;

const CaloriesCard = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--card) 0%, rgba(203, 19, 19, 0.1) 100%);
  border: 1px solid var(--primary);
  
  .info h2 { font-size: 32px; color: var(--primary); margin: 0; }
  .info span { color: var(--muted); font-size: 14px; }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0 15px;
  margin-bottom: 20px;

  svg { color: var(--muted); font-size: 20px; margin-right: 10px; }
  input { border: none; background: transparent; padding: 15px 0; color: var(--text); flex: 1; outline: none; font-size: 16px; }
  input::placeholder { color: var(--muted); }
`;

const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
  max-height: 50vh;
  overflow-y: auto;
`;

const ProductItem = styled(Card)`
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover { border-color: var(--primary); }
  
  .img-container { width: 50px; height: 50px; border-radius: 8px; background-color: var(--bg); display: flex; align-items: center; justify-content: center; overflow: hidden; }
  img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .info { flex: 1; display: flex; flex-direction: column; }
  .name { font-weight: 600; font-size: 14px; color: var(--text); }
  .brand { font-size: 11px; color: var(--muted); }
  .macros { font-size: 11px; color: var(--primary); font-weight: 500; margin-top: 4px; }
`;

const MealSection = styled.div`
  margin-bottom: 25px;
`;

const MealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 15px;
`;

const MealItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);

  &:last-child { border-bottom: none; }
  .name { font-size: 14px; color: var(--text); }
  .details { font-size: 12px; color: var(--muted); }
  .cals { font-weight: 600; color: var(--primary); }
`;

const DateSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);

  button { background: none; border: none; color: var(--text); display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; }
  button:hover { background-color: var(--bg); }
  span { font-weight: 600; font-size: 16px; }
`;


// Modal Styles
const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
`;
const ModalContent = styled(motion.div)`
  background: var(--bg); width: 100%; max-width: 400px;
  border-radius: 20px; padding: 25px; border: 1px solid var(--border);
  max-height: 90vh; overflow-y: auto;
`;
const AccordionWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 25px;
`;
const AccordionHeader = styled.div`
  width: 100%; height: 50px; background-color: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 0 15px; color: var(--text); font-size: 16px; 
  display: flex; align-items: center; justify-content: space-between; cursor: pointer;
`;
const AccordionList = styled(motion.div)`
  position: absolute; top: 55px; left: 0; right: 0;
  background-color: var(--card); border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden; z-index: 10;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;
const AccordionItem = styled.div`
  padding: 15px; color: var(--text); font-size: 16px; cursor: pointer;
  border-bottom: 1px solid var(--border);
  &:last-child { border-bottom: none; }
  &:hover { background-color: var(--bg); }
`;
const AddButton = styled.button`
  width: 100%; height: 50px; background-color: var(--primary); color: #000;
  border-radius: 12px; font-weight: 700; font-size: 16px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px;
`;


const Nutricao = () => {
    const { usuario } = useAuth();
    const { dados } = useUsuario();
    const [date, setDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    // Day Data
    const [dayData, setDayData] = useState({
        calorias: 0,
        proteinas: 0,
        carboidratos: 0,
        gorduras: 0,
        refeicoes: {
            'Café da Manhã': [],
            'Lanche da Manhã': [],
            'Almoço': [],
            'Lanche da Tarde': [],
            'Jantar': [],
            'Ceia': []
        }
    });

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [porcao, setPorcao] = useState(100);
    const [mealType, setMealType] = useState('Café da Manhã');
    const [isMealAccordionOpen, setIsMealAccordionOpen] = useState(false);

    const mealOptions = ["Café da Manhã", "Lanche da Manhã", "Almoço", "Lanche da Tarde", "Jantar", "Ceia"];

    const metaProteina = dados?.proteinaDiaria ? parseInt(dados.proteinaDiaria) : 150;
    const metaCalorias = 2000; // Placeholder, could be calculated

    const formatDate = (d) => {
        return d.toISOString().split('T')[0];
    };

    const loadDayData = async (targetDate) => {
        if (!usuario) return;
        const dateStr = formatDate(targetDate);
        const docRef = doc(db, `usuarios/${usuario.uid}/diario_nutricao`, dateStr);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // Garante que todas as refeições existam
            const refeicoes = {
                'Café da Manhã': [], 'Lanche da Manhã': [], 'Almoço': [], 'Lanche da Tarde': [], 'Jantar': [], 'Ceia': [],
                ...(data.refeicoes || {})
            };
            setDayData({ ...data, refeicoes });
        } else {
            setDayData({
                calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0,
                refeicoes: { 'Café da Manhã': [], 'Lanche da Manhã': [], 'Almoço': [], 'Lanche da Tarde': [], 'Jantar': [], 'Ceia': [] }
            });
        }
    };

    useEffect(() => {
        loadDayData(date);
    }, [date, usuario]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                const res = await searchProducts(searchQuery);
                setSearchResults(res);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 600); // 600ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const prevDay = () => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() - 1);
        setDate(newDate);
    };

    const nextDay = () => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        setDate(newDate);
    };

    const openFoodModal = (food) => {
        setSelectedFood(food);
        setPorcao(100);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleAddFood = async () => {
        if (!selectedFood || !porcao) return;

        const mult = parseFloat(porcao) / 100;
        const macros = {
            cals: Math.round(selectedFood.calorias_100g * mult),
            prot: Math.round(selectedFood.proteinas_100g * mult),
            carb: Math.round(selectedFood.carboidratos_100g * mult),
            fat: Math.round(selectedFood.gorduras_100g * mult),
        };

        const newItem = {
            id: Date.now().toString(),
            nome: selectedFood.nome,
            porcaoG: parseFloat(porcao),
            ...macros
        };

        const newData = { ...dayData };
        newData.refeicoes[mealType].push(newItem);
        newData.calorias += macros.cals;
        newData.proteinas += macros.prot;
        newData.carboidratos += macros.carb;
        newData.gorduras += macros.fat;

        setDayData(newData);
        setSelectedFood(null);

        // Save to DB
        try {
            const dateStr = formatDate(date);
            const docRef = doc(db, `usuarios/${usuario.uid}/diario_nutricao`, dateStr);
            await setDoc(docRef, newData, { merge: true });
            toast.success('Alimento adicionado!');
        } catch (error) {
            console.error("Erro ao salvar alimento", error);
            toast.error('Erro ao salvar');
        }
    };

    const handleDeleteFood = async (itemToRemove, mealTitle) => {
        const newData = { ...dayData };

        // Remove item from array
        newData.refeicoes[mealTitle] = newData.refeicoes[mealTitle].filter(i => i.id !== itemToRemove.id);

        // Subtract macros
        newData.calorias -= itemToRemove.cals;
        newData.proteinas -= itemToRemove.prot;
        newData.carboidratos -= itemToRemove.carb;
        newData.gorduras -= itemToRemove.fat;

        // Prevent negative values just in case
        if (newData.calorias < 0) newData.calorias = 0;
        if (newData.proteinas < 0) newData.proteinas = 0;
        if (newData.carboidratos < 0) newData.carboidratos = 0;
        if (newData.gorduras < 0) newData.gorduras = 0;

        setDayData(newData);

        // Save to DB
        try {
            const dateStr = formatDate(date);
            const docRef = doc(db, `usuarios/${usuario.uid}/diario_nutricao`, dateStr);
            await setDoc(docRef, newData, { merge: true });
            toast.success('Alimento removido!');
        } catch (error) {
            console.error("Erro ao remover alimento", error);
            toast.error('Erro ao remover');
        }
    };

    const renderMealSection = (titulo) => {
        const items = dayData.refeicoes[titulo] || [];
        const totalCals = items.reduce((acc, curr) => acc + curr.cals, 0);

        return (
            <MealSection key={titulo}>
                <MealHeader>
                    <div>
                        <Typography.H3 style={{ fontSize: '18px', margin: 0 }}>{titulo}</Typography.H3>
                        <Typography.Small style={{ color: 'var(--muted)' }}>{totalCals} kcal</Typography.Small>
                    </div>
                </MealHeader>
                {items.length === 0 ? (
                    <Typography.Body style={{ fontSize: '13px', color: 'var(--muted)' }}>Nenhum alimento registrado.</Typography.Body>
                ) : (
                    items.map(item => (
                        <MealItem key={item.id}>
                            <div>
                                <div className="name">{item.nome}</div>
                                <div className="details">{item.porcaoG}g • {item.prot}g P / {item.carb}g C / {item.fat}g G</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div className="cals">{item.cals} kcal</div>
                                <button
                                    onClick={() => handleDeleteFood(item, titulo)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ff4d4d',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '5px'
                                    }}
                                >
                                    <FiX size={18} />
                                </button>
                            </div>
                        </MealItem>
                    ))
                )}
            </MealSection>
        );
    };

    return (
        <AppShell>
            <Container style={{ paddingTop: '20px', paddingBottom: '80px' }}>

                <Flex $justify="space-between" $align="center" style={{ marginBottom: '20px' }}>
                    <Typography.H2 style={{ margin: 0 }}>Nutrição</Typography.H2>
                </Flex>

                <DateSelector>
                    <button onClick={prevDay}><FiChevronLeft size={24} /></button>
                    <span>{date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                    <button onClick={nextDay}><FiChevronRight size={24} /></button>
                </DateSelector>

                <CaloriesCard>
                    <div className="info">
                        <h2>{dayData.calorias}</h2>
                        <span>kcal consumidas</span>
                    </div>
                    <FiPieChart size={40} color="var(--primary)" style={{ opacity: 0.8 }} />
                </CaloriesCard>

                <MacrosGrid>
                    <MacroCard>
                        <div className="value">{Math.round(dayData.proteinas)}g</div>
                        <div className="label">Proteína</div>
                        <div className="meta">Meta: {metaProteina}g</div>
                    </MacroCard>
                    <MacroCard>
                        <div className="value">{Math.round(dayData.carboidratos)}g</div>
                        <div className="label">Carboidratos</div>
                    </MacroCard>
                    <MacroCard>
                        <div className="value">{Math.round(dayData.gorduras)}g</div>
                        <div className="label">Gorduras</div>
                    </MacroCard>
                </MacrosGrid>

                <Flex $justify="space-between" $align="center" style={{ marginBottom: '15px' }}>
                    <Typography.H3 style={{ margin: 0 }}>Refeições do Dia</Typography.H3>
                    <button
                        onClick={() => setIsSearchModalOpen(true)}
                        style={{ background: 'var(--primary)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiPlus /> Refeição
                    </button>
                </Flex>

                {renderMealSection('Café da Manhã')}
                {renderMealSection('Lanche da Manhã')}
                {renderMealSection('Almoço')}
                {renderMealSection('Lanche da Tarde')}
                {renderMealSection('Jantar')}
                {renderMealSection('Ceia')}
            </Container>

            {/* Modal de Busca */}
            <AnimatePresence>
                {isSearchModalOpen && !selectedFood && (
                    <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                            <Flex $justify="space-between" $align="center" style={{ marginBottom: '20px' }}>
                                <Typography.H3 style={{ margin: 0 }}>Buscar Alimento</Typography.H3>
                                <button onClick={() => { setIsSearchModalOpen(false); setSearchQuery(''); setSearchResults([]); }} style={{ background: 'none', border: 'none', color: 'var(--muted)' }}>Cancelar</button>
                            </Flex>

                            <SearchBar>
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Buscar alimentos, marcas..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </SearchBar>

                            {isSearching && <Typography.Body style={{ textAlign: 'center', marginBottom: '20px' }}>Buscando alimentos...</Typography.Body>}

                            {searchResults.length > 0 && (
                                <SearchResults>
                                    {searchResults.map(p => (
                                        <ProductItem key={p.id} onClick={() => openFoodModal(p)}>
                                            <div className="img-container">
                                                {p.imagem ? <img src={p.imagem} alt={p.nome} /> : <FiSearch />}
                                            </div>
                                            <div className="info">
                                                <span className="name">{p.nome}</span>
                                                <span className="brand">{p.marca}</span>
                                                <span className="macros">{Math.round(p.calorias_100g)} kcal / 100g</span>
                                            </div>
                                            <FiPlus color="var(--primary)" size={20} />
                                        </ProductItem>
                                    ))}
                                </SearchResults>
                            )}
                        </ModalContent>
                    </ModalOverlay>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedFood && (
                    <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <ModalContent initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
                            <Flex $justify="space-between" $align="center" style={{ marginBottom: '20px' }}>
                                <Typography.H3 style={{ margin: 0 }}>Adicionar Alimento</Typography.H3>
                                <button onClick={() => setSelectedFood(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)' }}>Cancelar</button>
                            </Flex>

                            <Typography.Body style={{ fontWeight: '700', marginBottom: '5px' }}>{selectedFood.nome}</Typography.Body>
                            <Typography.Small style={{ color: 'var(--primary)', marginBottom: '20px', display: 'block' }}>
                                {Math.round(selectedFood.calorias_100g)} kcal / 100g
                            </Typography.Small>

                            <InputWrapper>
                                <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px', display: 'block' }}>Quantidade (gramas/ml)</label>
                                <InputField
                                    type="number"
                                    value={porcao}
                                    onChange={(e) => setPorcao(e.target.value)}
                                    style={{ marginBottom: '15px' }}
                                />
                            </InputWrapper>

                            <label style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '5px', display: 'block' }}>Refeição</label>
                            <AccordionWrapper>
                                <AccordionHeader onClick={() => setIsMealAccordionOpen(!isMealAccordionOpen)}>
                                    {mealType}
                                    <FiChevronDown style={{ transform: isMealAccordionOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                </AccordionHeader>
                                <AnimatePresence>
                                    {isMealAccordionOpen && (
                                        <AccordionList initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                            {mealOptions.map(option => (
                                                <AccordionItem key={option} onClick={() => { setMealType(option); setIsMealAccordionOpen(false); }}>
                                                    {option}
                                                </AccordionItem>
                                            ))}
                                        </AccordionList>
                                    )}
                                </AnimatePresence>
                            </AccordionWrapper>

                            <AddButton onClick={handleAddFood}>
                                <FiCheck size={20} /> Adicionar ({Math.round(selectedFood.calorias_100g * (porcao / 100))} kcal)
                            </AddButton>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </AnimatePresence>
        </AppShell>
    );
};

export default Nutricao;
