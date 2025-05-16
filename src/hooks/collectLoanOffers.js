//this function will collect all the loan offers for a given loan request for a given user 
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

//function to collect loan offers
export const collectLoanRequests = async (userId) => {
    try {
        const db = getFirestore();
        const q = query(collection(db, "loanRequests"), where("borrowerId", "==", userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error collecting loan requests:", error);
        return [];
    }
};
//this function will collect all the loan offers for a given user
export const collectLoanOffers = async (loanRequestId, userId) => {
    try {
        const db = getFirestore();
        const q = query(
            collection(db, "loanOffers"), 
            where("loanRequestId", "==", loanRequestId),
            where("borrowerId", "==", userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error collecting loan offers:", error);
        return [];
    }
};
//function to get the total amount of loan offers for a given loan request

export const collectAllLoanOffers = async (userId) => {
    try {
        const loanRequests = await collectLoanRequests(userId);
        const loanOffers = [];
        
        for (const request of loanRequests) {
            const offers = await collectLoanOffers(request.id, userId);
            loanOffers.push(...offers);
        }
        
        return loanOffers;
    } catch (error) {
        console.error("Error collecting all loan offers:", error);
        return [];
    }
};

