import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Clock, Users, Save, X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { TableSkeleton } from '@/components/shared/skeleton-loader';
import type { HorarioEmpleadoResponseDto } from '@gym-saas/shared';

const DIAS_SEMANA: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

interface UserOption {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
}

type DiaSemanaKey = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function HorariosPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserOption[]>([]);
  const [horarios, setHorarios] = useState<HorarioEmpleadoResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const loadUsersAndHorarios = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, horariosRes] = await Promise.all([
        apiClient.users.findAll(),
        apiClient.horarios.findAll(),
      ]);

      const staffUsers = usersRes.users.filter((u) => u.rol !== 'cliente');
      setUsers(staffUsers);
      setHorarios(horariosRes.horarios);

      if (!selectedUserId && staffUsers.length > 0) {
        setSelectedUserId(staffUsers[0].id);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, toast]);

  useEffect(() => {
    loadUsersAndHorarios();
  }, []);

  const horariosDelUsuario = horarios.filter(
    (h) => h.usuarioId === selectedUserId,
  );

  const [horarioForm, setHorarioForm] = useState<
    Record<DiaSemanaKey, { horaInicio: string; horaFin: string }>
  >({
    0: { horaInicio: '09:00', horaFin: '17:00' },
    1: { horaInicio: '09:00', horaFin: '17:00' },
    2: { horaInicio: '09:00', horaFin: '17:00' },
    3: { horaInicio: '09:00', horaFin: '17:00' },
    4: { horaInicio: '09:00', horaFin: '17:00' },
    5: { horaInicio: '09:00', horaFin: '17:00' },
    6: { horaInicio: '09:00', horaFin: '17:00' },
  });

  useEffect(() => {
    if (horariosDelUsuario.length > 0) {
      const form = { ...horarioForm };
      for (const h of horariosDelUsuario) {
        form[h.diaSemana as DiaSemanaKey] = {
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
        };
      }
      setHorarioForm(form);
    }
  }, [selectedUserId, horariosDelUsuario]);

  const handleSave = async () => {
    if (!selectedUserId) return;
    setGuardando(true);

    try {
      for (const [diaStr, horas] of Object.entries(horarioForm)) {
        const dia = parseInt(diaStr) as DiaSemanaKey;
        const existeEnDia = horariosDelUsuario.find((h) => h.diaSemana === dia);

        if (existeEnDia) {
          await apiClient.horarios.update(existeEnDia.id, horas);
        } else {
          await apiClient.horarios.create({
            usuarioId: selectedUserId,
            diaSemana: dia,
            horaInicio: horas.horaInicio,
            horaFin: horas.horaFin,
          });
        }
      }

      const currentDias = new Set(
        Object.keys(horarioForm).map((d) => parseInt(d)),
      );
      for (const h of horariosDelUsuario) {
        if (!currentDias.has(h.diaSemana)) {
          await apiClient.horarios.delete(h.id);
        }
      }

      const horariosRes = await apiClient.horarios.findAll();
      setHorarios(horariosRes.horarios);
      setEditando(false);

      toast({
        title: 'Horarios guardados',
        description: 'Los horarios se actualizaron correctamente',
      });
    } catch (error) {
      console.error('Error guardando horarios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los horarios',
        variant: 'destructive',
      });
    } finally {
      setGuardando(false);
    }
  };

  const horarioDeDia = (dia: DiaSemanaKey) =>
    horariosDelUsuario.find((h) => h.diaSemana === dia);

  const filteredUsers = users.filter(
    (u) =>
      `${u.nombre} ${u.apellido} ${u.rol}`
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-950 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Horarios
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUser?.nombre} {currentUser?.apellido}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <TableSkeleton rows={6} columns={2} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de empleados */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar empleado..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">No hay empleados</p>
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setEditando(false);
                        }}
                        className={`w-full text-left p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selectedUserId === u.id
                            ? 'bg-indigo-50 border-l-4 border-indigo-600'
                            : ''
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {u.nombre} {u.apellido}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {u.rol}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Panel de horarios */}
            <div className="lg:col-span-3">
              {selectedUserId ? (
                <div className="bg-white dark:bg-gray-950 rounded-lg shadow">
                  <div className="p-6 border-b flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Horario de{' '}
                        {users.find((u) => u.id === selectedUserId)?.nombre}{' '}
                        {users.find((u) => u.id === selectedUserId)?.apellido}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configura los horarios de trabajo por día de la semana
                      </p>
                    </div>
                    {!editando ? (
                      <button
                        onClick={() => setEditando(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                      >
                        <Clock className="w-4 h-4" />
                        Editar Horarios
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditando(false);
                          }}
                          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-700 dark:text-gray-300 font-semibold px-4 py-2 rounded-lg transition text-sm"
                          disabled={guardando}
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
                          disabled={guardando}
                        >
                          <Save className="w-4 h-4" />
                          {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="space-y-3">
                      {([0, 1, 2, 3, 4, 5, 6] as DiaSemanaKey[]).map((dia) => {
                        const horario = horarioDeDia(dia);
                        return (
                          <div
                            key={dia}
                            className={`flex items-center gap-4 p-3 rounded-lg border ${
                              horario ? 'border-gray-200 dark:border-gray-700' : 'border-dashed border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {DIAS_SEMANA[dia]}
                            </div>

                            {editando ? (
                              <>
                                <input
                                  type="time"
                                  value={horarioForm[dia]?.horaInicio ?? ''}
                                  onChange={(e) =>
                                    setHorarioForm((prev) => ({
                                      ...prev,
                                      [dia]: {
                                        ...prev[dia],
                                        horaInicio: e.target.value,
                                      },
                                    }))
                                  }
                                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <span className="text-gray-400 dark:text-gray-500">a</span>
                                <input
                                  type="time"
                                  value={horarioForm[dia]?.horaFin ?? ''}
                                  onChange={(e) =>
                                    setHorarioForm((prev) => ({
                                      ...prev,
                                      [dia]: {
                                        ...prev[dia],
                                        horaFin: e.target.value,
                                      },
                                    }))
                                  }
                                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                              </>
                            ) : horario ? (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                                  {horario.horaInicio} - {horario.horaFin}
                                </span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  Activo
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                                Sin horario asignado
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-950 rounded-lg shadow p-8 text-center">
                  <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                    Selecciona un empleado
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Elige un empleado de la lista para ver o editar su horario
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
