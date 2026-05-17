import React, { useEffect, useState } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, ActivityIndicator, 
  Modal, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';

const CATEGORIAS = {
  receita: ['Salário', 'Freelance', 'Investimentos', 'Aluguel', 'Outros'],
  despesa: ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Vestuário', 'Outros'],
};

export default function HomeScreen() {
  const [transacoes, setTransacoes] = useState([]);
  const [transacoesExcluidas, setTransacoesExcluidas] = useState([]);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  
  // Abas
  const [aba, setAba] = useState('ativas'); 

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: 'despesa',
    categoria: '',
    valor: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadNome = async () => setNome(await AsyncStorage.getItem('nome') || '');
    loadNome();
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const mes = new Date().getMonth() + 1;
      const ano = new Date().getFullYear();
      const [resResumo, resTransacoes, resExcluidas] = await Promise.all([
        api.get(`/transacoes/resumo?mes=${mes}&ano=${ano}`),
        api.get(`/transacoes?mes=${mes}&ano=${ano}`),
        api.get(`/transacoes/excluidos?mes=${mes}&ano=${ano}`)
      ]);
      setResumo(resResumo.data);
      setTransacoes(resTransacoes.data);
      setTransacoesExcluidas(resExcluidas.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  const handleAdicionar = async () => {
    if (!novaTransacao.categoria || !novaTransacao.valor || !novaTransacao.data) {
      Alert.alert('Aviso', 'Preencha o valor, a data e selecione uma categoria.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/transacoes', novaTransacao);
      setNovaTransacao({
        tipo: 'despesa', categoria: '', valor: '', descricao: '',
        data: new Date().toISOString().split('T')[0],
      });
      setModalVisible(false);
      carregarDados();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.erro || 'Erro ao adicionar transação');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletar = async (id) => {
    Alert.alert('Atenção', 'Deseja mover esta transação para a lixeira?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sim, deletar', 
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/transacoes/${id}`);
            carregarDados();
          } catch (err) {
            Alert.alert('Erro', 'Erro ao remover transação');
          }
        }
      }
    ]);
  };

  const handleRestaurar = async (id) => {
    try {
      await api.patch(`/transacoes/${id}/restaurar`);
      carregarDados();
    } catch {
      Alert.alert('Erro', 'Erro ao restaurar transação');
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
  };

  const handleValorChange = (texto) => {
    const apenasNumeros = texto.replace(/\D/g, '');
    if (apenasNumeros === '') {
      setNovaTransacao({ ...novaTransacao, valor: '' });
      return;
    }
    const valorFloat = (parseInt(apenasNumeros, 10) / 100).toFixed(2);
    setNovaTransacao({ ...novaTransacao, valor: valorFloat });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const transacoesExibidas = aba === 'ativas' ? transacoes : transacoesExcluidas;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="px-6 py-4 flex-row justify-between items-center bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 bg-blue-600 rounded-full items-center justify-center">
            <Text className="text-white font-bold">{nome.charAt(0).toUpperCase()}</Text>
          </View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white">Olá, {nome.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} className="bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-lg">
          <Text className="text-red-600 dark:text-red-400 font-semibold text-sm">Sair</Text>
        </TouchableOpacity>
      </View>
      
      <View className="flex-1 px-6 pt-6">
        {/* Card Resumo */}
        <View className="bg-blue-600 rounded-3xl p-6 shadow-xl shadow-blue-500/40 mb-6">
          <Text className="text-blue-100 font-medium text-sm">Saldo Atual</Text>
          <Text className="text-4xl font-bold text-white mt-1 tracking-tight">{formatarMoeda(resumo.saldo)}</Text>
          <View className="flex-row mt-6 gap-8">
            <View>
              <Text className="text-blue-200 text-xs mb-1">Receitas</Text>
              <Text className="text-white font-semibold text-base">{formatarMoeda(resumo.receitas)}</Text>
            </View>
            <View>
              <Text className="text-blue-200 text-xs mb-1">Despesas</Text>
              <Text className="text-white font-semibold text-base">{formatarMoeda(resumo.despesas)}</Text>
            </View>
          </View>
        </View>
        
        {/* Abas */}
        <View className="flex-row gap-4 mb-4">
          <TouchableOpacity 
            className={`pb-2 border-b-2 ${aba === 'ativas' ? 'border-blue-600' : 'border-transparent'}`}
            onPress={() => setAba('ativas')}
          >
            <Text className={`font-bold ${aba === 'ativas' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>Ativas</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`pb-2 border-b-2 ${aba === 'excluidas' ? 'border-red-600' : 'border-transparent'}`}
            onPress={() => setAba('excluidas')}
          >
            <Text className={`font-bold ${aba === 'excluidas' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'}`}>Lixeira</Text>
          </TouchableOpacity>
        </View>
        
        {/* Lista */}
        <FlatList
          data={transacoesExibidas}
          keyExtractor={t => t.id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className="text-slate-500 mt-10 text-center">Nenhuma transação na aba atual.</Text>}
          renderItem={({item}) => (
            <View className={`flex-row items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl mb-3 shadow-sm border border-slate-100 dark:border-slate-800 ${aba === 'excluidas' ? 'opacity-70' : ''}`}>
              <View className="flex-row items-center gap-3 flex-1">
                <View className={`h-10 w-10 rounded-full items-center justify-center ${item.tipo === 'receita' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <Text className={item.tipo === 'receita' ? 'text-green-600 dark:text-green-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold'}>
                    {item.tipo === 'receita' ? '↑' : '↓'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-900 dark:text-white text-base">{item.categoria}</Text>
                  {item.descricao ? <Text className="text-slate-400 text-xs" numberOfLines={1}>{item.descricao}</Text> : null}
                  <Text className="text-slate-500 text-xs mt-0.5">{new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</Text>
                </View>
              </View>
              
              <View className="items-end gap-2">
                <Text className={`font-bold text-base ${item.tipo === 'receita' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {item.tipo === 'receita' ? '+' : '-'} {formatarMoeda(item.valor).replace(/^R\$\s*/, 'R$ ')}
                </Text>
                
                {aba === 'ativas' ? (
                  <TouchableOpacity onPress={() => handleDeletar(item.id)} className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                    <Text className="text-red-500 text-xs font-semibold">Excluir</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleRestaurar(item.id)} className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">
                    <Text className="text-blue-500 text-xs font-semibold">Restaurar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 h-14 w-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/50"
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white text-3xl font-light mb-1">+</Text>
      </TouchableOpacity>

      {/* Modal Nova Transação */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">Nova Transação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-100 dark:bg-slate-800 h-8 w-8 rounded-full items-center justify-center">
                <Text className="text-slate-500 font-bold">X</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-6">
              {/* Tipo */}
              <View>
                <Text className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Tipo de Registro</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity 
                    className={`flex-1 py-3 rounded-xl border-2 items-center ${novaTransacao.tipo === 'despesa' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-800'}`}
                    onPress={() => setNovaTransacao({...novaTransacao, tipo: 'despesa', categoria: ''})}
                  >
                    <Text className={`font-semibold ${novaTransacao.tipo === 'despesa' ? 'text-red-600' : 'text-slate-500'}`}>💸 Despesa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className={`flex-1 py-3 rounded-xl border-2 items-center ${novaTransacao.tipo === 'receita' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-800'}`}
                    onPress={() => setNovaTransacao({...novaTransacao, tipo: 'receita', categoria: ''})}
                  >
                    <Text className={`font-semibold ${novaTransacao.tipo === 'receita' ? 'text-green-600' : 'text-slate-500'}`}>💰 Receita</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Valor e Data */}
              <View className="flex-row gap-4 mt-6">
                <View className="flex-1">
                  <Text className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Valor (R$)</Text>
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-semibold text-lg"
                    placeholder="0,00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={novaTransacao.valor ? formatarMoeda(novaTransacao.valor).replace(/^R\$\s*/, '') : ''}
                    onChangeText={handleValorChange}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Data</Text>
                  <TextInput
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white font-semibold text-lg"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                    value={novaTransacao.data}
                    onChangeText={v => setNovaTransacao({...novaTransacao, data: v})}
                  />
                </View>
              </View>

              {/* Categoria */}
              <View className="mt-6">
                <Text className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Categoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                  {(CATEGORIAS[novaTransacao.tipo] || []).map(cat => (
                    <TouchableOpacity 
                      key={cat}
                      className={`px-4 py-2 rounded-full border ${novaTransacao.categoria === cat ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-slate-300 dark:border-slate-700'} mr-2`}
                      onPress={() => setNovaTransacao({...novaTransacao, categoria: cat})}
                    >
                      <Text className={`font-semibold ${novaTransacao.categoria === cat ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Descrição */}
              <View className="mt-6 mb-8">
                <Text className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Descrição (Opcional)</Text>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
                  placeholder="Ex: Conta de luz, Almoço..."
                  placeholderTextColor="#94a3b8"
                  value={novaTransacao.descricao}
                  onChangeText={v => setNovaTransacao({...novaTransacao, descricao: v})}
                />
              </View>

              <TouchableOpacity 
                className="bg-blue-600 active:bg-blue-700 rounded-xl py-4 items-center justify-center shadow-lg shadow-blue-500/30"
                onPress={handleAdicionar}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">Salvar Transação</Text>
                )}
              </TouchableOpacity>
              
              {/* Espaço em branco no final para o scroll ficar confortável */}
              <View className="h-10" />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}
