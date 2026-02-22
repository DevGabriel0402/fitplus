import React, { useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firestore";
import { Container, Linha, Label, Input, Select, Textarea, Botao } from "./styles";

export default function CadastroExercicio() {
    const [form, setForm] = useState({
        idPublico: "",
        categoria: "peito",
        nome: "",
        gifUrl: "",
        alvo: "",
        equipamento: "",
        serie: 3,
        rept: 15,
        dicas: "",
    });

    const [salvando, setSalvando] = useState(false);

    function onChange(e) {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    }

    async function salvar(e) {
        e.preventDefault();
        if (!form.idPublico.trim()) return alert("Informe o ID (ex: peito001).");
        if (!form.nome.trim()) return alert("Informe o nome.");

        try {
            setSalvando(true);

            await setDoc(
                doc(db, "exercicios", form.idPublico),
                {
                    ...form,
                    serie: Number(form.serie),
                    rept: Number(form.rept),
                    atualizadoEm: serverTimestamp(),
                    criadoEm: serverTimestamp(),
                },
                { merge: true }
            );

            alert("Exercício salvo!");
            setForm((p) => ({
                ...p,
                idPublico: "",
                nome: "",
                gifUrl: "",
                alvo: "",
                equipamento: "",
                dicas: "",
            }));
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <Container>
            <h2>Cadastrar exercício</h2>

            <form onSubmit={salvar}>
                <Linha>
                    <div>
                        <Label>ID (ex: peito001)</Label>
                        <Input name="idPublico" value={form.idPublico} onChange={onChange} />
                    </div>

                    <div>
                        <Label>Categoria</Label>
                        <Select name="categoria" value={form.categoria} onChange={onChange}>
                            <option value="peito">Peito</option>
                            <option value="triceps">Tríceps</option>
                            <option value="abdomen">Abdômen</option>
                        </Select>
                    </div>
                </Linha>

                <Label>Nome</Label>
                <Input name="nome" value={form.nome} onChange={onChange} />

                <Linha>
                    <div>
                        <Label>Séries</Label>
                        <Input name="serie" type="number" value={form.serie} onChange={onChange} />
                    </div>
                    <div>
                        <Label>Repetições</Label>
                        <Input name="rept" type="number" value={form.rept} onChange={onChange} />
                    </div>
                </Linha>

                <Label>Alvo</Label>
                <Input name="alvo" value={form.alvo} onChange={onChange} />

                <Label>Equipamento</Label>
                <Input name="equipamento" value={form.equipamento} onChange={onChange} />

                <Label>URL do GIF</Label>
                <Input name="gifUrl" value={form.gifUrl} onChange={onChange} placeholder="https://..." />

                <Label>Dicas</Label>
                <Textarea name="dicas" value={form.dicas} onChange={onChange} rows={5} />

                <Botao type="submit" disabled={salvando}>
                    {salvando ? "Salvando..." : "Salvar exercício"}
                </Botao>
            </form>
        </Container>
    );
}