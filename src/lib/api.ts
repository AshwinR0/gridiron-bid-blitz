import { supabase } from "./supabaseClient";

/**
 * Fetches the list of auctions from the database.
 * @returns {Promise<{ data: any[] | null, error: any }>} The list of auctions or an error.
 */
export async function fetchAuctions() {
  const { data, error } = await supabase
    .from("auctions")
    .select("id, name, status, created_at, min_player_price");

  if (error) {
    console.error("Error fetching auctions:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Fetches the details of a specific auction from the database.
 * @param {string} auctionId - The ID of the auction to fetch.
 * @returns {Promise<{ data: any | null, error: any }>} The auction details or an error.
 */
export async function fetchAuctionDetails(auctionId: string) {
  const { data, error } = await supabase
    .from("auctions")
    .select("id, name, status, created_at, min_player_price, teams:teams!fk_teams_auction(id, name, budget, min_players), players:players!auction_players(id, name, position)")
    .eq("id", auctionId)
    .single();

  if (error) {
    console.error("Error fetching auction details:", error);
    return { data: null, error };
  }

  return { data, error: null };
}