import { supabase } from './supabaseClient'

export interface Ticket {
  id: string
  eventname: string
  participantname: string
  date: string
  time: string
  address: string
  qrcode: string
  status: 'valid' | 'used'
  createdat: string
  deleted: boolean
}

// Créer un nouveau billet
export async function createTicket(ticketData: Omit<Ticket, 'id' | 'createdat' | 'status' | 'deleted'>) {
  // Vérifier que supabase est configuré
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  
  // Générer un ID aléatoire sécurisé
  const randomId = crypto.randomUUID ? crypto.randomUUID() : 
    'ticket-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();

  const newTicket = {
    ...ticketData,
    id: randomId,
    status: 'valid' as const,
    createdat: new Date().toISOString(),
    deleted: false // S'assurer que le billet n'est pas marqué comme supprimé
  }

  console.log("Création d'un billet avec ID:", randomId);
  
  const { data, error } = await supabase
    .from('tickets')
    .insert(newTicket)
    .select()

  console.log("Résultat de la création:", { data, error });

  if (error) {
    throw new Error(error.message)
  }

  return data[0]
}

// Obtenir tous les billets (non supprimés)
export async function getAllTickets() {
  // Vérifier que supabase est configuré
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('deleted', false)
    .order('createdat', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Obtenir les billets supprimés (dans la corbeille)
export async function getDeletedTickets() {
  // Vérifier que supabase est configuré
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('deleted', true)
    .order('createdat', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Mettre à jour le statut d'un billet
export async function updateTicketStatus(ticketId: string, status: 'valid' | 'used') {
  // Vérifier que supabase est configuré
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data[0]
}

// Marquer un billet comme supprimé (mettre dans la corbeille)
export async function deleteTicket(ticketId: string) {
  // Vérifier que supabase est configuré
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .update({ deleted: true })
    .eq('id', ticketId)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data[0]
}

// Restaurer un billet depuis la corbeille
export async function restoreTicket(ticketId: string) {
  // Vérifier que supabase est configuré
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .update({ deleted: false })
    .eq('id', ticketId)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data[0]
}

// Supprimer définitivement un billet
export async function permanentlyDeleteTicket(ticketId: string) {
  // Vérifier que supabase est configuré
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Obtenir un billet par son ID
export async function getTicketById(ticketId: string) {
  // Vérifier que supabase est configuré
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
  }
  
  console.log("Recherche du billet avec ID:", ticketId);
  
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('deleted', false) // Ne retourner que les billets non supprimés
    .single()

  console.log("Résultat de la recherche:", { data, error });
  
  if (error) {
    throw new Error(error.message)
  }

  return data
}