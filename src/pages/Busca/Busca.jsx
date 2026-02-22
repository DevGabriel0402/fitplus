import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiArrowLeft, FiFilter, FiActivity, FiBriefcase } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../ui/AppShell/AppShell';
import { Container, Typography, Card, Flex, InputField } from '../../ui/components/BaseUI';

const SearchHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  margin-bottom: 25px;
`;

const SearchInputWrapper = styled.div`
  flex: 1;
  position: relative;
  
  svg {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
  }

  input {
    padding-left: 45px;
    background-color: var(--card);
  }
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 15px;
  margin-top: 30px;
`;

const ChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Tag = styled.div`
  padding: 8px 16px;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 14px;
  color: var(--muted);
  cursor: pointer;
`;

const RecentSearchItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-size: 14px;
`;

const Busca = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const recentSearches = ['Full Body Burn', 'Yoga for beginners', 'Protein snacks', 'Leg day'];
  const popularTopics = ['HIIT', 'Nutrição', 'Yoga', 'Massa Muscular', 'Perda de Peso'];

  return (
    <AppShell>
      <Container>
        <SearchHeader>
          <button onClick={() => navigate(-1)}><FiArrowLeft size={24} color="var(--text)" /></button>
          <SearchInputWrapper>
            <FiSearch />
            <InputField
              placeholder="Busque treinos, artigos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </SearchInputWrapper>
          <button style={{ color: 'var(--primary)' }}><FiFilter size={24} /></button>
        </SearchHeader>

        <SectionTitle>Assuntos Populares</SectionTitle>
        <ChipGroup>
          {popularTopics.map(topic => (
            <Tag key={topic} onClick={() => setQuery(topic)}>{topic}</Tag>
          ))}
        </ChipGroup>

        <SectionTitle>Buscas Recentes</SectionTitle>
        {recentSearches.map(search => (
          <RecentSearchItem key={search} onClick={() => setQuery(search)}>
            <Flex $gap="10px">
              <FiSearch size={14} color="var(--muted)" />
              {search}
            </Flex>
            <FiArrowLeft size={16} color="var(--muted)" style={{ transform: 'rotate(135deg)' }} />
          </RecentSearchItem>
        ))}

        <SectionTitle>Categorias</SectionTitle>
        <Grid>
          <CategoryCard $color="#9b8cff">
            <FiActivity size={24} />
            <h4>Treinos</h4>
          </CategoryCard>
          <CategoryCard $color="#d7ff4a">
            <FiBriefcase size={24} style={{ color: '#000' }} />
            <h4 style={{ color: '#000' }}>Alimentação</h4>
          </CategoryCard>
        </Grid>
      </Container>
    </AppShell>
  );
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 40px;
`;

const CategoryCard = styled(Card)`
  background-color: ${({ $color }) => $color};
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: none;
  
  h4 { font-weight: 800; }
`;


export default Busca;
