import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verifica se já está logado
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        router.replace('/home'); // Vai para a tela principal
      }
    };
    checkLogin();
  }, []);

  const handleSubmit = async () => {
    if (!email || !senha || (!isLogin && !nome)) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const response = await api.post('/auth/login', { email, senha });
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('nome', response.data.nome);
        router.replace('/home');
      } else {
        await api.post('/auth/register', { nome, email, senha });
        Alert.alert('Sucesso', 'Conta criada! Faça o login.');
        setIsLogin(true);
      }
    } catch (err) {
      console.error("ERRO COMPLETO:", err);
      Alert.alert('Erro de Conexão', err.message + " - Verifique se o backend está rodando e acessível.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-950 justify-center px-6">
      <View className="items-center mb-10">
        <View className="h-16 w-16 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
          <Text className="text-white font-bold text-2xl">F</Text>
        </View>
        <Text className="text-3xl font-bold text-slate-900 dark:text-white">Financiária</Text>
        <Text className="text-slate-500 dark:text-slate-400 mt-2">
          {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta para começar'}
        </Text>
      </View>

      <View className="space-y-4">
        {!isLogin && (
          <View>
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Nome</Text>
            <TextInput
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
              placeholder="Seu nome"
              placeholderTextColor="#94a3b8"
              value={nome}
              onChangeText={setNome}
            />
          </View>
        )}

        <View className="mt-4">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">E-mail</Text>
          <TextInput
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
            placeholder="seu@email.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="mt-4">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Senha</Text>
          <TextInput
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white"
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
        </View>

        <TouchableOpacity
          className="bg-blue-600 active:bg-blue-700 rounded-xl py-4 items-center justify-center shadow-lg shadow-blue-500/30 mt-6"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-4 items-center p-2"
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text className="text-slate-600 dark:text-slate-400 text-sm">
            {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
            <Text className="text-blue-600 font-semibold">
              {isLogin ? 'Cadastre-se' : 'Faça login'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
